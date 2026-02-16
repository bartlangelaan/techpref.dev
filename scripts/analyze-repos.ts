import { last, sortBy } from "es-toolkit";
import { execa, ExecaError } from "execa";
import { ensureDir, outputJson, remove } from "fs-extra/esm";
import { glob } from "glob";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { OxlintConfig } from "oxlint";
import type {
  AnalysisResult,
  RepositoryData,
  VariantResult,
  ViolationSample,
} from "@/lib/types";
import { getAnalyzedVersion } from "@/lib/analysis-version";
import {
  checkoutRepository,
  commit,
  getCheckoutCommit,
  getRemoteRepoInfo,
  pullRebase,
  push,
  removeRepository,
} from "@/lib/git";
import {
  loadAnalysis,
  loadData,
  loadFailingInfo,
  removeFailingInfo,
  REPOS_DIR,
  saveAnalysis,
  saveFailingInfo,
} from "@/lib/types";
import { distributedSample } from "@/lib/utils";
import { allRuleChecks, type OxlintRuleCheck } from "./rules";

const require = createRequire(import.meta.url);

/**
 * Get the commit date of the current HEAD commit as an ISO 8601 UTC string.
 */
async function getCommitDate(repoPath: string): Promise<string> {
  const { stdout } = await execa("git", ["log", "-1", "--format=%cI"], {
    cwd: repoPath,
  });
  // Parse and convert to UTC with Z suffix
  return new Date(stdout).toISOString();
}

/**
 * Oxlint JSON output diagnostic format.
 */
interface OxlintDiagnostic {
  message: string;
  code?: string;
  severity: string;
  filename?: string;
  labels: Array<{
    span: {
      offset: number;
      length: number;
      line: number;
      column: number;
    };
  }>;
}

/**
 * Oxlint JSON output format.
 */
interface OxlintOutput {
  diagnostics: OxlintDiagnostic[];
}

const ignorePatterns = [
  "**/node_modules/**",
  "**/dist/**",
  "**/build/**",
  "**/*.d.ts",
  // Ignore intentionally bad code in babel/babel
  "**/packages/babel-*/test/**",

  // Ignore intentionally bad code in microsoft/TypeScript
  "**/tests/cases/**",
  "**/tests/baselines/**",
];

/**
 * Find all TypeScript/JavaScript files in a repository.
 */
async function findSourceFiles(repoPath: string): Promise<string[]> {
  return glob("**/*.{ts,tsx,js,jsx,cjs,mjs,cjsx,mjsx,cts,mts,ctsx,mtsx}", {
    cwd: repoPath,
    absolute: true,
    ignore: ignorePatterns,
  });
}

/**
 * Run an Oxlint rule check using CLI with temp config file.
 */
async function runOxlintCheck(
  repoPath: string,
  ruleCheck: OxlintRuleCheck,
  maxSamples: number = 10,
): Promise<VariantResult> {
  console.log(`  Running check: ${ruleCheck.ruleId} (${ruleCheck.variant})...`);
  // Create unique temp directory for this check
  const tempDir = join(
    tmpdir(),
    `oxlint-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  const configPath = join(tempDir, ".oxlintrc.json");
  try {
    await ensureDir(tempDir);

    // Write Oxlint config with all default categories disabled
    // and only the specific rule enabled
    const config: OxlintConfig = {
      categories: {
        correctness: "off",
        suspicious: "off",
        pedantic: "off",
        perf: "off",
        style: "off",
        restriction: "off",
        nursery: "off",
      },
      rules: {
        [ruleCheck.oxlintConfig.rule]: ruleCheck.oxlintConfig.config,
      },
      plugins: ruleCheck.oxlintConfig.plugins,
    };
    // Add JS plugins if specified (for ESLint plugin compatibility)
    // Resolve to absolute paths since config is in temp directory
    if (ruleCheck.oxlintConfig.jsPlugins?.length) {
      config.jsPlugins = ruleCheck.oxlintConfig.jsPlugins.map((plugin) =>
        require.resolve(plugin),
      );
    }
    await outputJson(configPath, config);

    const timeout = 5 * 60 * 1000; // 5 minute timeout per check

    // We need to pass the stdout to a file because oxlint fails if it is not a
    // TTY and stdout is too large.
    // See: https://github.com/oxc-project/oxc/issues/19124
    const $ = execa({
      preferLocal: true,
      cwd: repoPath,
      reject: false,
      timeout,
    });

    // Somehow, the timeout option in execa does not seem to work reliably with
    // oxlint, so we implement our own timeout logic as a fallback.
    const timeoutPromise = Promise.withResolvers<never>();
    const timeoutId = setTimeout(
      timeoutPromise.reject,
      timeout + 5000,
      `Oxlint timed out after ${timeout + 5000}ms`,
    );

    const subprocess = $("oxlint", [
      "-c",
      configPath,
      "--format",
      "json",
      ...ignorePatterns.flatMap((pattern) => ["--ignore-pattern", pattern]),
    ]);

    const result = await Promise.race([subprocess, timeoutPromise.promise]);

    clearTimeout(timeoutId);

    if (result.timedOut && result instanceof ExecaError) {
      throw result;
    }

    const { stdout, stderr } = result;

    if (stderr) {
      // Oxlint may output warnings to stderr, but we can still parse stdout
      console.warn(`Oxlint warnings for ${repoPath}:\n${stderr}`);
    }

    try {
      return parseOxlintOutput(stdout, repoPath, maxSamples);
    } catch (error) {
      console.warn(
        `\n\nCould not parse oxlint output: ${repoPath}:\n${stdout}`,
      );

      throw error;
    }
  } finally {
    // Cleanup temp directory
    await remove(tempDir).catch(() => {
      // Ignore cleanup errors
    });
  }
}

/**
 * Parse Oxlint JSON output into VariantResult.
 */
function parseOxlintOutput(
  stdout: string,
  repoPath: string,
  maxSamples: number,
): VariantResult {
  const output: OxlintOutput = JSON.parse(stdout);

  const sortedDiagnostics = sortBy(
    output.diagnostics.filter((d) => d.filename),
    [(diag) => diag.filename],
  );

  const samples = distributedSample(
    sortedDiagnostics,
    maxSamples,
  ).map<ViolationSample>((diag) => {
    // Get path relative to repo root
    const relativePath = diag.filename!.startsWith(repoPath)
      ? diag.filename!.slice(repoPath.length + 1)
      : diag.filename!;
    return {
      file: relativePath,
      line: diag.labels[0]?.span.line ?? 0,
      column: diag.labels[0]?.span.column ?? 0,
      message: diag.message,
    };
  });

  return {
    count: output.diagnostics.length,
    samples,
  };
}

/**
 * Log the results of a single rule check.
 */
function logRuleCheckResult(
  ruleId: string,
  variant: string,
  result: VariantResult,
): void {
  console.log(`  Found ${result.count} violations`);
  for (const sample of distributedSample(result.samples, 3)) {
    console.log(`    - ${sample.file}:${sample.line} - ${sample.message}`);
  }
}

/**
 * Analyze a single repository with all rule checks using Oxlint.
 */
async function analyzeRepository(
  repo: RepositoryData,
  analyzedVersion: string,
): Promise<AnalysisResult> {
  const repoPath = join(REPOS_DIR, repo.fullName);
  const [analyzedCommit, analyzedCommitDate] = await Promise.all([
    getCheckoutCommit(repoPath),
    getCommitDate(repoPath),
  ]);

  const checks: AnalysisResult["checks"] = {};

  // Run all Oxlint checks (one per variant due to different rule configs)
  for (const ruleCheck of allRuleChecks) {
    if (!checks[ruleCheck.ruleId]) {
      checks[ruleCheck.ruleId] = {};
    }
    const result = await runOxlintCheck(repoPath, ruleCheck);
    checks[ruleCheck.ruleId][ruleCheck.variant] = result;
    logRuleCheckResult(ruleCheck.ruleId, ruleCheck.variant, result);
  }

  return {
    analyzedVersion,
    analyzedCommit,
    analyzedCommitDate,
    checks,
  };
}

// Parse command line arguments
const { values: args } = parseArgs({
  options: {
    "gh-action": {
      type: "boolean",
      default: false,
    },
    repo: {
      type: "string",
    },
  },
});

const ghAction = args["gh-action"];

console.log("=== TechPref Repository Analyzer ===\n");

// Get analyzed version (commit is fetched per-repository)
const currentVersion = getAnalyzedVersion();

console.log(`Current rule version: ${currentVersion}\n`);

// Load data
const data = loadData();
if (!data) {
  console.error(
    "No repositories found. Run 'pnpm fetch-repos' first to fetch the repository list.",
  );
  process.exit(1);
}

console.log(`Total repositories: ${data.repositories.length}`);

let repoAnalyzeInfo = await Promise.all(
  data.repositories
    .filter((repo) => !args.repo || repo.fullName === args.repo)
    .map(async (repo) => {
      const analysis = loadAnalysis(repo.fullName);

      const remoteInfo = await getRemoteRepoInfo(repo.cloneUrl);

      let analyseReason:
        | "no-analysis"
        | "version-mismatch"
        | "commit-mismatch"
        | false = false;

      if (!analysis) {
        analyseReason = "no-analysis";
      } else if (analysis.analyzedVersion !== currentVersion) {
        analyseReason = "version-mismatch";
      } else if (remoteInfo.latestCommit !== analysis.analyzedCommit) {
        analyseReason = "commit-mismatch";
      }

      const failingInfo = loadFailingInfo(repo.fullName);
      const failing = !failingInfo
        ? false
        : failingInfo.failedCommit === remoteInfo.latestCommit
          ? ("current-commit" as const)
          : ("older-commit" as const);

      return {
        repo,
        analyseReason,
        remoteInfo,
        failing,
        commit: remoteInfo.latestCommit,
        fileCount: 0, // Placeholder, will be filled later
      };
    }),
);

let prevCount = data.repositories.length;
repoAnalyzeInfo = repoAnalyzeInfo.filter((i) => i.analyseReason);
console.log(
  `Completely up-to-date analysis: ${prevCount - repoAnalyzeInfo.length}`,
);

if (repoAnalyzeInfo.length === 0) {
  console.log("\nNo repositories to analyze.");
  process.exit(0);
}

console.log(`To analyze: ${repoAnalyzeInfo.length}`);
console.log(
  `  - No analysis: ${repoAnalyzeInfo.filter((i) => i.analyseReason === "no-analysis").length}`,
);
console.log(
  `  - Version mismatch: ${repoAnalyzeInfo.filter((i) => i.analyseReason === "version-mismatch").length}`,
);
console.log(
  `  - Commit mismatch: ${repoAnalyzeInfo.filter((i) => i.analyseReason === "commit-mismatch").length}`,
);

console.log("Counting source files...");

await Promise.all(
  repoAnalyzeInfo.map(async (info) => {
    const repoPath = join(REPOS_DIR, info.repo.fullName);
    const files = await findSourceFiles(repoPath);
    info.fileCount = files.length;
  }),
);

console.log("Done counting source files, now sorting...");

repoAnalyzeInfo = sortBy(repoAnalyzeInfo, [
  // Run failing repos last, especially if current commit matches failed commit
  (i) => (!i.failing ? 0 : i.failing === "older-commit" ? 1 : 2),
  (i) =>
    i.analyseReason === "no-analysis"
      ? 0
      : i.analyseReason === "version-mismatch"
        ? 1
        : 2,
  (i) => i.fileCount,
  () => Math.random(), // Add some randomness to avoid always analyzing in the same order
]);

console.log(
  `Sorted. Smallest: ${repoAnalyzeInfo[0]?.fileCount ?? 0} files, Largest: ${last(repoAnalyzeInfo)?.fileCount ?? 0} files.\n`,
);

const startTime = new Date().getTime();
let timeSinceLastPush = new Date().getTime();

let completed = 0;
for (const { repo, fileCount, commit: repoCommit } of repoAnalyzeInfo) {
  if (ghAction && new Date().getTime() - startTime > 55 * 60 * 1000) {
    console.log(
      `Passed the 55 minute mark, stopping analysis. Completed ${completed}/${repoAnalyzeInfo.length} repositories.`,
    );
    break;
  }

  if (ghAction && new Date().getTime() - timeSinceLastPush > 5 * 60 * 1000) {
    console.log(`Pushing changes after 5 minutes to avoid losing progress.`);
    await push(process.cwd());
    timeSinceLastPush = new Date().getTime();
  }

  console.log(
    `[${completed + 1}/${repoAnalyzeInfo.length}] Analyzing ${repo.fullName}${fileCount > 0 ? ` (${fileCount} files)` : ""}...`,
  );

  try {
    console.log("  Checking out repository...");
    await checkoutRepository(repo);
    const result = await analyzeRepository(repo, currentVersion);

    // Pull before saving anything.
    if (ghAction) await pullRebase(process.cwd());

    // Save analysis to separate file
    saveAnalysis(repo.fullName, result);
    console.log(
      `  Saved analysis to data/analysis/${repo.fullName.replace("/", "-")}.json`,
    );

    // Remove failing info if analysis succeeds
    removeFailingInfo(repo.fullName);
  } catch (error) {
    console.error(`  Error analyzing ${repo.fullName}:`, error);

    // Pull before saving anything.
    if (ghAction) await pullRebase(process.cwd());

    // Save failing info so we deprioritize this repo in future runs
    saveFailingInfo(repo.fullName, {
      failedCommit: repoCommit,
    });
  }

  // In gh-action mode, commit and push after each repo
  if (ghAction) {
    await commit(process.cwd(), `Update analysis for ${repo.fullName}`);

    // Remove repository from local storage to save space
    await removeRepository(repo.fullName);
  }

  completed++;
}

await push(process.cwd());
console.log(`\n=== Analysis Complete ===`);

process.exit(0);

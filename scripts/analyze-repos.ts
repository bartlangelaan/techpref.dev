import { ESLint, type Linter } from "eslint";
import { glob } from "glob";
import globals from "globals";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import tseslint from "typescript-eslint";
import type {
  AnalysisResult,
  RepositoryData,
  VariantResult,
  ViolationSample,
} from "@/lib/types";
import { loadAnalysis, loadData, REPOS_DIR, saveAnalysis } from "@/lib/types";
import { distributedSample } from "@/lib/utils";
import {
  allRuleChecks,
  type EslintRuleCheck,
  type OxlintRuleCheck,
  type RuleCheck,
} from "./rules";

const execFileAsync = promisify(execFile);

/**
 * Get the current git commit hash from a repository.
 * If repoPath is not provided, uses the current working directory.
 */
async function getCurrentCommit(repoPath?: string): Promise<string> {
  try {
    const { stdout } = await execFileAsync("git", ["rev-parse", "HEAD"], {
      cwd: repoPath,
    });
    return stdout.trim();
  } catch {
    return "unknown";
  }
}

/**
 * Get the commit date of the current HEAD commit as an ISO 8601 UTC string.
 * If repoPath is not provided, uses the current working directory.
 */
async function getCommitDate(repoPath?: string): Promise<string> {
  try {
    const { stdout } = await execFileAsync(
      "git",
      ["log", "-1", "--format=%cI"],
      {
        cwd: repoPath,
      },
    );
    // Parse and convert to UTC with Z suffix
    return new Date(stdout.trim()).toISOString();
  } catch {
    return "unknown";
  }
}

/**
 * Generate a hash of the allRuleChecks object.
 */
function getAnalyzedVersion(): string {
  const hash = createHash("sha256");
  hash.update(JSON.stringify(allRuleChecks));
  return hash.digest("hex").slice(0, 12);
}

/**
 * Oxlint JSON output diagnostic format.
 */
interface OxlintDiagnostic {
  message: string;
  code: string;
  severity: string;
  filename: string;
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

/**
 * Find all TypeScript/JavaScript files in a repository.
 */
async function findSourceFiles(repoPath: string): Promise<string[]> {
  return glob("**/*.{ts,tsx,js,jsx}", {
    cwd: repoPath,
    absolute: true,
    ignore: ["**/node_modules/**", "**/dist/**", "**/build/**", "**/*.d.ts"],
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
  // Create unique temp directory for this check
  const tempDir = join(
    tmpdir(),
    `oxlint-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  const configPath = join(tempDir, ".oxlintrc.json");

  try {
    await mkdir(tempDir, { recursive: true });

    // Write Oxlint config with all default categories disabled
    // and only the specific rule enabled
    const config = {
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
    await writeFile(configPath, JSON.stringify(config));

    // Run oxlint with all default plugins disabled to only check our rule
    const { stdout, stderr } = await execFileAsync(
      "npx",
      [
        "oxlint",
        "-c",
        configPath,
        "--format",
        "json",
        "--ignore-pattern",
        "**/node_modules/**",
        "--ignore-pattern",
        "**/dist/**",
        "--ignore-pattern",
        "**/build/**",
        "--ignore-pattern",
        "**/*.d.ts",
        ".",
      ],
      {
        cwd: repoPath,
        maxBuffer: 50 * 1024 * 1024, // 50MB buffer for large repos
      },
    );
    if (stderr.trim().length > 0) {
      // Oxlint may output warnings to stderr, but we can still parse stdout
      console.warn(`Oxlint warnings for ${repoPath}: ${stderr}`);
    }

    return parseOxlintOutput(stdout, repoPath, maxSamples);
  } catch (error: unknown) {
    // Oxlint exits with non-zero if there are errors, but still outputs JSON to stdout
    if (
      error &&
      typeof error === "object" &&
      "stdout" in error &&
      typeof error.stdout === "string" &&
      error.stdout.length > 0
    ) {
      try {
        return parseOxlintOutput(error.stdout, repoPath, maxSamples);
      } catch {
        // JSON parsing failed, return empty result
        return { count: 0, samples: [] };
      }
    }
    // Complete failure (e.g., oxlint not found, or other error)
    return { count: 0, samples: [] };
  } finally {
    // Cleanup temp directory
    await rm(tempDir, { recursive: true, force: true }).catch(() => {
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

  const samples = distributedSample(
    output.diagnostics,
    maxSamples,
  ).map<ViolationSample>((diag) => {
    // Get path relative to repo root
    const relativePath = diag.filename.startsWith(repoPath)
      ? diag.filename.slice(repoPath.length + 1)
      : diag.filename;
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
 * Run a single ESLint rule check and count violations.
 */
async function runEslintCheck(
  files: string[],
  ruleCheck: EslintRuleCheck,
  repoPath: string,
  maxSamples: number = 10,
): Promise<VariantResult> {
  if (files.length === 0) {
    return { count: 0, samples: [] };
  }

  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: [
      {
        files: ["**/*.{js,jsx}"],
        languageOptions: {
          ecmaVersion: "latest",
          sourceType: "module",
          parserOptions: {
            ecmaFeatures: {
              jsx: true,
            },
          },
          globals: {
            ...globals.es2022,
            ...globals.node,
            ...globals.browser,
          },
        },
        linterOptions: {
          noInlineConfig: true,
        },
        rules: ruleCheck.eslintConfig as Linter.RulesRecord,
      },
      {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
          ecmaVersion: "latest",
          sourceType: "module",
          parser: tseslint.parser,
          parserOptions: {
            ecmaFeatures: {
              jsx: true,
            },
          },
          globals: {
            ...globals.es2022,
            ...globals.node,
            ...globals.browser,
          },
        },
        linterOptions: {
          noInlineConfig: true,
        },
        rules: ruleCheck.eslintConfig as Linter.RulesRecord,
      },
    ],
  });

  try {
    const results = await eslint.lintFiles(files);

    const violations = results.flatMap((result) =>
      result.messages.flatMap<ViolationSample>((message) =>
        message.severity === 2
          ? [
              {
                file: result.filePath.replace(repoPath + "/", ""),
                line: message.line,
                column: message.column,
                message: message.message,
              },
            ]
          : [],
      ),
    );
    const samples = distributedSample(violations, maxSamples);

    return { count: violations.length, samples };
  } catch {
    // If ESLint fails (e.g., parsing errors), return 0
    return { count: 0, samples: [] };
  }
}

/**
 * Type guard to check if a rule check uses Oxlint.
 */
function isOxlintRuleCheck(ruleCheck: RuleCheck): ruleCheck is OxlintRuleCheck {
  return "oxlintConfig" in ruleCheck && ruleCheck.oxlintConfig !== undefined;
}

/**
 * Log the results of a single rule check.
 */
function logRuleCheckResult(
  ruleId: string,
  variant: string,
  result: VariantResult,
): void {
  console.log(`  ${ruleId}: ${variant}=${result.count}`);
  for (const sample of distributedSample(result.samples, 3)) {
    console.log(`    - ${sample.file}:${sample.line} - ${sample.message}`);
  }
}

/**
 * Analyze a single repository with all rule checks.
 * Uses Oxlint for rules that support it (faster), ESLint for others.
 */
async function analyzeRepository(
  repo: RepositoryData,
  analyzedVersion: string,
): Promise<AnalysisResult> {
  const repoPath = join(REPOS_DIR, repo.fullName);
  const [analyzedCommit, analyzedCommitDate] = await Promise.all([
    getCurrentCommit(repoPath),
    getCommitDate(repoPath),
  ]);

  // Separate rules by linter type
  const oxlintRules = allRuleChecks.filter(isOxlintRuleCheck);
  const eslintRules = allRuleChecks.filter(
    (r): r is EslintRuleCheck => !isOxlintRuleCheck(r),
  );

  const checks: AnalysisResult["checks"] = {};

  // Run Oxlint checks (one per variant due to different rule configs)
  for (const ruleCheck of oxlintRules) {
    if (!checks[ruleCheck.ruleId]) {
      checks[ruleCheck.ruleId] = {};
    }
    const result = await runOxlintCheck(repoPath, ruleCheck);
    checks[ruleCheck.ruleId][ruleCheck.variant] = result;
    logRuleCheckResult(ruleCheck.ruleId, ruleCheck.variant, result);
  }

  // Run ESLint checks (need files list for ESLint API)
  if (eslintRules.length > 0) {
    const files = await findSourceFiles(repoPath);

    for (const ruleCheck of eslintRules) {
      if (!checks[ruleCheck.ruleId]) {
        checks[ruleCheck.ruleId] = {};
      }
      const result = await runEslintCheck(files, ruleCheck, repoPath);
      checks[ruleCheck.ruleId][ruleCheck.variant] = result;
      logRuleCheckResult(ruleCheck.ruleId, ruleCheck.variant, result);
    }
  }

  return {
    analyzedVersion,
    analyzedCommit,
    analyzedCommitDate,
    checks,
  };
}

interface RepoWithFileCount {
  repo: RepositoryData;
  fileCount: number;
}

async function main() {
  console.log("=== TechPref Repository Analyzer ===\n");

  // Get analyzed version (commit is fetched per-repository)
  const currentVersion = getAnalyzedVersion();

  console.log(`Current rule version: ${currentVersion}\n`);

  // Log which linter is used for each rule
  const oxlintRuleIds = allRuleChecks
    .filter(isOxlintRuleCheck)
    .map((r) => r.ruleId);
  const eslintRuleIds = allRuleChecks
    .filter((r) => !isOxlintRuleCheck(r))
    .map((r) => r.ruleId);

  const uniqueOxlintRules = [...new Set(oxlintRuleIds)];
  const uniqueEslintRules = [...new Set(eslintRuleIds)];

  console.log(`Using Oxlint for: ${uniqueOxlintRules.join(", ") || "(none)"}`);
  console.log(`Using ESLint for: ${uniqueEslintRules.join(", ") || "(none)"}`);
  console.log();

  // Load data
  const data = loadData();
  if (!data) {
    console.error(
      "No repositories found. Run 'pnpm fetch-repos' first to fetch the repository list.",
    );
    process.exit(1);
  }

  // Filter repos that need analysis (exists on filesystem but analysis is null, version mismatch, or commit mismatch)
  const reposToAnalyzeUnsorted: RepositoryData[] = [];
  let alreadyAnalyzed = 0;
  let notCloned = 0;

  for (const repo of data.repositories) {
    const repoPath = join(REPOS_DIR, repo.fullName);
    if (!existsSync(repoPath)) {
      notCloned++;
      continue;
    }
    // Load analysis from separate file
    const analysis = loadAnalysis(repo.fullName);
    if (analysis === null) {
      // No analysis exists, needs to be analyzed
      reposToAnalyzeUnsorted.push(repo);
      continue;
    }
    if (analysis.analyzedVersion !== currentVersion) {
      // Rule version changed, needs to be re-analyzed
      reposToAnalyzeUnsorted.push(repo);
      continue;
    }
    // Check if the commit has changed
    const currentCommit = await getCurrentCommit(repoPath);
    if (analysis.analyzedCommit !== currentCommit) {
      // Repository was updated, needs to be re-analyzed
      reposToAnalyzeUnsorted.push(repo);
      continue;
    }
    // Analysis is up to date
    alreadyAnalyzed++;
  }

  console.log(`Total repositories: ${data.repositories.length}`);
  console.log(`Already analyzed: ${alreadyAnalyzed}`);
  console.log(`Not yet cloned: ${notCloned}`);
  console.log(`To analyze: ${reposToAnalyzeUnsorted.length}`);

  if (reposToAnalyzeUnsorted.length === 0) {
    console.log("\nNo repositories to analyze.");
    return;
  }

  console.log(`\nCounting source files to sort by size (smallest first)...`);

  // Pre-scan to count files and sort by size (smallest first)
  const reposWithCounts: RepoWithFileCount[] = [];
  for (const repo of reposToAnalyzeUnsorted) {
    const repoPath = join(REPOS_DIR, repo.fullName);
    const files = await findSourceFiles(repoPath);
    reposWithCounts.push({ repo, fileCount: files.length });
  }

  // Sort by file count ascending (smallest repos first)
  reposWithCounts.sort((a, b) => a.fileCount - b.fileCount);

  console.log(
    `Sorted. Smallest: ${reposWithCounts[0]?.fileCount ?? 0} files, Largest: ${reposWithCounts[reposWithCounts.length - 1]?.fileCount ?? 0} files.\n`,
  );

  let completed = 0;
  for (const { repo, fileCount } of reposWithCounts) {
    console.log(
      `[${completed + 1}/${reposWithCounts.length}] Analyzing ${repo.fullName} (${fileCount} files)...`,
    );

    try {
      const result = await analyzeRepository(repo, currentVersion);

      // Save analysis to separate file
      saveAnalysis(repo.fullName, result);
      console.log(
        `  Saved analysis to data/analysis/${repo.fullName.replace("/", "-")}.json`,
      );
    } catch (error) {
      console.error(`  Error analyzing ${repo.fullName}:`, error);
    }

    completed++;
  }

  const totalAnalyzed = data.repositories.filter(
    (r) => loadAnalysis(r.fullName) !== null,
  ).length;
  console.log(`\n=== Analysis Complete ===`);
  console.log(`Total repositories analyzed: ${totalAnalyzed}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

import { sortBy } from "es-toolkit";
import { execa } from "execa";
import { glob } from "glob";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { OxlintConfig } from "oxlint";
import type {
  AnalysisResult,
  RepositoryData,
  VariantResult,
  ViolationSample,
} from "@/lib/types";
import { loadAnalysis, loadData, REPOS_DIR, saveAnalysis } from "@/lib/types";
import { distributedSample } from "@/lib/utils";
import { allRuleChecks, type OxlintRuleCheck } from "./rules";

const require = createRequire(import.meta.url);

/**
 * Get the current git commit hash from a repository.
 * If repoPath is not provided, uses the current working directory.
 */
async function getCurrentCommit(repoPath?: string): Promise<string> {
  try {
    const { stdout } = await execa("git", ["rev-parse", "HEAD"], {
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
    const { stdout } = await execa("git", ["log", "-1", "--format=%cI"], {
      cwd: repoPath,
    });
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
  const outputPath = join(tempDir, "lint-result.json");
  try {
    await mkdir(tempDir, { recursive: true });

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
    await writeFile(configPath, JSON.stringify(config));

    const timeout = 60 * 1000; // 1 minute timeout per check

    // We need to pass the stdout to a file because oxlint fails if it is not a
    // TTY and stdout is too large.
    // See: https://github.com/oxc-project/oxc/issues/19124
    const $ = execa({
      preferLocal: true,
      cwd: repoPath,
      reject: false,
      shell: true,
      timeout,
    });

    // Somehow, the timeout option in execa does not seem to work reliably with
    // oxlint, so we implement our own timeout logic as a fallback.
    const timeoutPromise = Promise.withResolvers<never>();
    const timeoutId = setTimeout(
      timeoutPromise.reject,
      timeout,
      "Oxlint timed out",
    );

    const subprocess = $("oxlint", [
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
      ">",
      outputPath,
    ]);

    const { stderr } = await Promise.race([subprocess, timeoutPromise.promise]);

    clearTimeout(timeoutId);

    if (stderr) {
      // Oxlint may output warnings to stderr, but we can still parse stdout
      console.warn(`Oxlint warnings for ${repoPath}:\n${stderr}`);
    }

    const stdout = await readFile(outputPath, "utf-8");

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

  const sortedDiagnostics = sortBy(output.diagnostics, [
    (diag) => diag.filename,
  ]);

  const samples = distributedSample(
    sortedDiagnostics,
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
 * Analyze a single repository with all rule checks using Oxlint.
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

interface RepoWithFileCount {
  repo: RepositoryData;
  fileCount: number;
}

async function main() {
  console.log("=== TechPref Repository Analyzer ===\n");

  // Get analyzed version (commit is fetched per-repository)
  const currentVersion = getAnalyzedVersion();

  console.log(`Current rule version: ${currentVersion}\n`);

  // Log all rules being checked
  const uniqueRuleIds = [...new Set(allRuleChecks.map((r) => r.ruleId))];
  console.log(`Rules: ${uniqueRuleIds.join(", ")}\n`);

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

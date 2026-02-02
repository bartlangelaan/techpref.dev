import type {
  AnalysisResult,
  RepositoryData,
  VariantResult,
  ViolationSample,
} from "@/lib/types";
import { loadData, REPOS_DIR, saveData } from "@/lib/types";
import { ESLint, type Linter } from "eslint";
import { glob } from "glob";
import globals from "globals";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import tseslint from "typescript-eslint";
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
  const samples: ViolationSample[] = [];

  for (const diag of output.diagnostics) {
    if (samples.length >= maxSamples) break;

    // Get path relative to repo root
    const relativePath = diag.filename.startsWith(repoPath)
      ? diag.filename.slice(repoPath.length + 1)
      : diag.filename;

    samples.push({
      file: relativePath,
      line: diag.labels[0]?.span.line ?? 0,
      column: diag.labels[0]?.span.column ?? 0,
      message: diag.message,
    });
  }

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
    let violationCount = 0;
    const samples: ViolationSample[] = [];

    for (const result of results) {
      violationCount += result.errorCount;

      // Collect sample violations
      if (samples.length < maxSamples) {
        for (const message of result.messages) {
          if (message.severity === 2 && samples.length < maxSamples) {
            // Get path relative to repo root
            const relativePath = result.filePath.replace(repoPath + "/", "");
            samples.push({
              file: relativePath,
              line: message.line,
              column: message.column,
              message: message.message,
            });
          }
        }
      }
    }
    return { count: violationCount, samples };
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
  for (const sample of result.samples.slice(0, 3)) {
    console.log(
      `    - ${sample.file}:${sample.line} - ${sample.message}`,
    );
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
  const analyzedCommit = await getCurrentCommit(repoPath);

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

  // Filter repos that need analysis (clonedAt is set but analysis is null or version mismatch)
  const reposToAnalyzeUnsorted = data.repositories.filter((repo) => {
    const repoPath = join(REPOS_DIR, repo.fullName);
    if (repo.clonedAt === null || !existsSync(repoPath)) {
      return false;
    }
    // Re-analyze if analysis doesn't exist or if rule version changed
    return (
      repo.analysis === null ||
      repo.analysis.analyzedVersion !== currentVersion
    );
  });

  // Count only repos with current analysis (matching rule version)
  const alreadyAnalyzed = data.repositories.filter(
    (r) => r.analysis !== null && r.analysis.analyzedVersion === currentVersion,
  ).length;
  const notCloned = data.repositories.filter((r) => r.clonedAt === null).length;

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
      const result = await analyzeRepository(
        repo,
        currentVersion,
      );

      // Update the repository's analysis
      repo.analysis = result;

      // Save after each analysis to preserve progress
      saveData(data);
    } catch (error) {
      console.error(`  Error analyzing ${repo.fullName}:`, error);
    }

    completed++;
  }

  const totalAnalyzed = data.repositories.filter(
    (r) => r.analysis !== null,
  ).length;
  console.log(`\n=== Analysis Complete ===`);
  console.log(`Total repositories analyzed: ${totalAnalyzed}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

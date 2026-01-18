import { ESLint, type Linter } from "eslint";
import { glob } from "glob";
import globals from "globals";
import { existsSync } from "node:fs";
import { join } from "node:path";
import tseslint from "typescript-eslint";
import {
  loadData,
  REPOS_DIR,
  saveData,
  type AnalysisResult,
  type RepositoryData,
} from "./data.js";
import { allRuleChecks, type RuleCheck } from "./rules/index.js";

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

interface RuleCheckResult {
  count: number;
  samples: string[];
}

/**
 * Run a single ESLint rule check and count violations.
 */
async function runRuleCheck(
  files: string[],
  ruleCheck: RuleCheck,
  maxSamples: number = 5,
): Promise<RuleCheckResult> {
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
    const samples: string[] = [];

    for (const result of results) {
      violationCount += result.errorCount;

      // Collect sample violations
      if (samples.length < maxSamples) {
        for (const message of result.messages) {
          if (message.severity === 2 && samples.length < maxSamples) {
            const relativePath = result.filePath.replace(
              process.cwd() + "/",
              "",
            );
            samples.push(
              `${relativePath}:${message.line}:${message.column} - ${message.message}`,
            );
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

interface AnalyzeResult {
  result: AnalysisResult;
  samplesByVariant: Map<string, string[]>;
}

/**
 * Analyze a single repository with all rule checks.
 */
async function analyzeRepository(repo: RepositoryData): Promise<AnalyzeResult> {
  const repoPath = join(REPOS_DIR, repo.fullName);
  const files = await findSourceFiles(repoPath);

  const checks: AnalysisResult["checks"] = {};
  const samplesByVariant = new Map<string, string[]>();

  for (const ruleCheck of allRuleChecks) {
    if (!checks[ruleCheck.ruleId]) {
      checks[ruleCheck.ruleId] = {};
    }
    const { count, samples } = await runRuleCheck(files, ruleCheck);
    checks[ruleCheck.ruleId][ruleCheck.variant] = count;
    samplesByVariant.set(`${ruleCheck.ruleId}/${ruleCheck.variant}`, samples);
  }

  return {
    result: {
      analyzedAt: new Date().toISOString(),
      checks,
    },
    samplesByVariant,
  };
}

interface RepoWithFileCount {
  repo: RepositoryData;
  fileCount: number;
}

async function main() {
  console.log("=== TechPref Repository Analyzer ===\n");

  // Load data
  const data = loadData();
  if (!data) {
    console.error(
      "No repositories found. Run 'pnpm fetch-repos' first to fetch the repository list.",
    );
    process.exit(1);
  }

  // Filter repos that need analysis (clonedAt is set but analysis is null)
  const reposToAnalyzeUnsorted = data.repositories.filter((repo) => {
    const repoPath = join(REPOS_DIR, repo.fullName);
    return repo.clonedAt !== null && repo.analysis === null && existsSync(repoPath);
  });

  const alreadyAnalyzed = data.repositories.filter((r) => r.analysis !== null).length;
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
      const { result, samplesByVariant } = await analyzeRepository(repo);

      // Update the repository's analysis
      repo.analysis = result;

      // Save after each analysis to preserve progress
      saveData(data);

      // Print summary for this repo
      for (const [ruleId, variants] of Object.entries(result.checks)) {
        const variantSummary = Object.entries(variants)
          .map(([v, count]) => `${v}=${count}`)
          .join(", ");
        console.log(`  ${ruleId}: ${variantSummary}`);

        // Print sample violations for each variant
        for (const [variant, count] of Object.entries(variants)) {
          if (count > 0) {
            const samples = samplesByVariant.get(`${ruleId}/${variant}`) || [];
            if (samples.length > 0) {
              console.log(`    ${variant} samples:`);
              for (const sample of samples) {
                console.log(`      - ${sample}`);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(`  Error analyzing ${repo.fullName}:`, error);
    }

    completed++;
  }

  const totalAnalyzed = data.repositories.filter((r) => r.analysis !== null).length;
  console.log(`\n=== Analysis Complete ===`);
  console.log(`Total repositories analyzed: ${totalAnalyzed}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

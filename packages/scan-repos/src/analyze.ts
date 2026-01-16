import { ESLint, type Linter } from "eslint";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { glob } from "glob";
import type { Repository } from "./github.js";
import {
  allRuleChecks,
  type AnalysisOutput,
  type RepoAnalysisResult,
  type RuleCheck,
} from "./rules/index.js";

const REPOS_DIR = join(process.cwd(), "repos");
const RESULTS_FILE = join(process.cwd(), "analysis-results.json");

/**
 * Load existing analysis results from file.
 */
function loadExistingResults(): AnalysisOutput | null {
  if (!existsSync(RESULTS_FILE)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(RESULTS_FILE, "utf-8"));
  } catch {
    return null;
  }
}

/**
 * Save analysis results to file.
 */
function saveResults(output: AnalysisOutput): void {
  writeFileSync(RESULTS_FILE, JSON.stringify(output, null, 2));
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
 * Run a single ESLint rule check and count violations.
 */
async function runRuleCheck(
  files: string[],
  ruleCheck: RuleCheck
): Promise<number> {
  if (files.length === 0) {
    return 0;
  }

  const eslint = new ESLint({
    useEslintrc: false,
    overrideConfig: {
      env: {
        es2022: true,
        node: true,
        browser: true,
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      rules: ruleCheck.eslintConfig as Linter.RulesRecord,
    },
  });

  try {
    const results = await eslint.lintFiles(files);
    let violationCount = 0;
    for (const result of results) {
      violationCount += result.errorCount;
    }
    return violationCount;
  } catch {
    // If ESLint fails (e.g., parsing errors), return 0
    return 0;
  }
}

/**
 * Analyze a single repository with all rule checks.
 */
async function analyzeRepository(
  repo: Repository
): Promise<RepoAnalysisResult> {
  const repoPath = join(REPOS_DIR, repo.fullName);
  const files = await findSourceFiles(repoPath);

  const checks: RepoAnalysisResult["checks"] = {};

  for (const ruleCheck of allRuleChecks) {
    if (!checks[ruleCheck.ruleId]) {
      checks[ruleCheck.ruleId] = {};
    }
    const count = await runRuleCheck(files, ruleCheck);
    checks[ruleCheck.ruleId][ruleCheck.variant] = count;
  }

  return {
    repoFullName: repo.fullName,
    analyzedAt: new Date().toISOString(),
    checks,
  };
}

/**
 * Main analysis function.
 */
export async function analyzeRepositories(
  repos: Repository[]
): Promise<void> {
  // Load existing results for resume support
  let output = loadExistingResults();
  if (!output) {
    output = {
      startedAt: new Date().toISOString(),
      results: [],
    };
  }

  // Build set of already analyzed repos
  const analyzedRepos = new Set(output.results.map((r) => r.repoFullName));

  // Filter to repos that exist and haven't been analyzed
  const reposToAnalyze = repos.filter((repo) => {
    const repoPath = join(REPOS_DIR, repo.fullName);
    return existsSync(repoPath) && !analyzedRepos.has(repo.fullName);
  });

  console.log(`Found ${reposToAnalyze.length} repositories to analyze.`);
  console.log(`Already analyzed: ${analyzedRepos.size} repositories.\n`);

  let completed = 0;
  for (const repo of reposToAnalyze) {
    console.log(
      `[${completed + 1}/${reposToAnalyze.length}] Analyzing ${repo.fullName}...`
    );

    try {
      const result = await analyzeRepository(repo);
      output.results.push(result);
      saveResults(output);

      // Print summary for this repo
      for (const [ruleId, variants] of Object.entries(result.checks)) {
        const variantSummary = Object.entries(variants)
          .map(([v, count]) => `${v}=${count}`)
          .join(", ");
        console.log(`  ${ruleId}: ${variantSummary}`);
      }
    } catch (error) {
      console.error(`  Error analyzing ${repo.fullName}:`, error);
    }

    completed++;
  }

  console.log(`\n=== Analysis Complete ===`);
  console.log(`Total repositories analyzed: ${output.results.length}`);
  console.log(`Results saved to: ${RESULTS_FILE}`);
}

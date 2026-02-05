import { spawn } from "node:child_process";
import { existsSync, mkdirSync, rmdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import type { AnalysisResult, RepositoryData } from "@/lib/types";
import { octokit } from "@/lib/octokit";
import { loadAnalysis, loadData, REPOS_DIR } from "@/lib/types";

const CLONE_CONCURRENCY = 5;

/**
 * Clones a repository to the local repos directory.
 * Uses shallow clone (depth=1) to save disk space and time.
 */
async function cloneRepository(repo: RepositoryData): Promise<boolean> {
  const repoPath = join(REPOS_DIR, repo.fullName);

  if (existsSync(repoPath)) {
    rmSync(repoPath, { recursive: true, force: true });
    console.log(`Removed existing directory for ${repo.fullName}`);
  }

  // Ensure parent directory exists
  const parentDir = join(REPOS_DIR, repo.fullName.split("/")[0]);
  if (!existsSync(parentDir)) {
    mkdirSync(parentDir, { recursive: true });
  }

  return new Promise((resolve) => {
    const git = spawn(
      "git",
      ["clone", "--depth", "1", repo.cloneUrl, repoPath],
      {
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    let stderr = "";
    git.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    git.on("close", (code) => {
      if (code === 0) {
        console.log(`Cloned ${repo.fullName}`);
        resolve(true);
      } else {
        console.error(`Failed to clone ${repo.fullName}: ${stderr.trim()}`);
        resolve(false);
      }
    });

    git.on("error", (err) => {
      console.error(`Failed to clone ${repo.fullName}: ${err.message}`);
      resolve(false);
    });
  });
}

/**
 * Get the latest commit SHA on the default branch from GitHub.
 * Returns null if the API call fails.
 */
async function getLatestCommitFromGitHub(
  fullName: string,
): Promise<string | null> {
  const [owner, repo] = fullName.split("/");
  try {
    const { data } = await octokit.repos.listCommits({
      owner,
      repo,
      per_page: 1,
    });
    return data[0]?.sha ?? null;
  } catch {
    return null;
  }
}

/**
 * Check if a repository has new commits available that haven't been analyzed.
 * Returns true if there are new commits (analysis is outdated).
 */
async function hasNewCommits(
  fullName: string,
  analysis: AnalysisResult | null,
): Promise<boolean> {
  if (!analysis) {
    // No analysis exists, definitely has new commits
    return true;
  }

  const latestCommit = await getLatestCommitFromGitHub(fullName);
  if (latestCommit === null) {
    // API call failed, assume we need to analyze
    console.warn(`Warning: Could not fetch latest commit for ${fullName}`);
    return true;
  }
  return latestCommit !== analysis.analyzedCommit;
}

/**
 * Parse --oldestAnalyzed=N argument from command line.
 */
function parseOldestAnalyzedArg(): number | null {
  const arg = process.argv.find((a) => a.startsWith("--oldestAnalyzed="));
  if (!arg) {
    return null;
  }
  const value = parseInt(arg.split("=")[1], 10);
  if (isNaN(value) || value <= 0) {
    console.error(
      "Invalid --oldestAnalyzed value. Must be a positive integer.",
    );
    process.exit(1);
  }
  return value;
}

async function main() {
  console.log("=== TechPref Repository Cloner ===\n");

  const oldestAnalyzedLimit = parseOldestAnalyzedArg();

  // Load data
  const loadedData = loadData();
  if (!loadedData) {
    console.error(
      "No repositories found. Run 'pnpm fetch-repos' first to fetch the repository list.",
    );
    process.exit(1);
  }
  const data = loadedData;

  // Ensure repos directory exists
  if (!existsSync(REPOS_DIR)) {
    mkdirSync(REPOS_DIR, { recursive: true });
  }

  let reposToClone: RepositoryData[] = [];

  if (oldestAnalyzedLimit !== null) {
    // Load analysis data for each repo
    const reposWithAnalysis = data.repositories.map((repo) => ({
      repo,
      analysis: loadAnalysis(repo.fullName),
    }));

    // Sort by analyzedCommitDate: null (not analyzed) first, then oldest
    reposWithAnalysis.sort((a, b) => {
      const dateA = a.analysis?.analyzedCommitDate ?? null;
      const dateB = b.analysis?.analyzedCommitDate ?? null;
      // Repos without analysis come first
      if (dateA === null && dateB === null) return 0;
      if (dateA === null) return -1;
      if (dateB === null) return 1;
      // Then sort by oldest analyzedCommitDate
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });

    // Check repos in order until we find N that have new commits
    console.log(`Using --oldestAnalyzed=${oldestAnalyzedLimit}`);
    console.log(`Checking repos for new commits (oldest analyzed first)...\n`);

    let checkedCount = 0;
    let upToDateCount = 0;

    for (const { repo, analysis } of reposWithAnalysis) {
      if (reposToClone.length >= oldestAnalyzedLimit) {
        break;
      }
      checkedCount++;
      if (await hasNewCommits(repo.fullName, analysis)) {
        reposToClone.push(repo);
        console.log(
          `  [${reposToClone.length}/${oldestAnalyzedLimit}] ${repo.fullName} - has new commits`,
        );
      } else {
        upToDateCount++;
        console.log(`  [skip] ${repo.fullName} - already up-to-date`);
      }
    }

    console.log(`\nChecked ${checkedCount} repos`);
    console.log(`Repos already up-to-date: ${upToDateCount}`);
    console.log(`Selected ${reposToClone.length} repos with new commits`);
  } else {
    // Default behavior: filter repos that need cloning (not yet on filesystem)
    reposToClone = data.repositories.filter(
      (r) => !existsSync(join(REPOS_DIR, r.fullName)),
    );

    console.log(`Total repositories: ${data.repositories.length}`);
    console.log(
      `Already cloned: ${data.repositories.length - reposToClone.length}`,
    );
    console.log(`To clone: ${reposToClone.length}\n`);
  }

  if (reposToClone.length === 0) {
    console.log("All repositories are already cloned.");
    return;
  }

  let success = 0;
  let failed = 0;
  let index = 0;

  async function worker(): Promise<void> {
    while (index < reposToClone.length) {
      const repo = reposToClone[index++];
      const result = await cloneRepository(repo);
      if (result) {
        success++;
      } else {
        failed++;
      }
    }
  }

  // Start workers
  const workers = Array.from({ length: CLONE_CONCURRENCY }, () => worker());
  await Promise.all(workers);

  console.log(`\n=== Summary ===`);
  console.log(`Successfully cloned: ${success}`);
  console.log(`Failed: ${failed}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

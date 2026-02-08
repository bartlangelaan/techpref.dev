import { execa } from "execa";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import type { AnalysisResult, RepositoryData } from "@/lib/types";
import { getRemoteRepoInfo } from "@/lib/git";
import { octokit } from "@/lib/octokit";
import { loadAnalysis, loadData, REPOS_DIR } from "@/lib/types";

const CLONE_CONCURRENCY = 5;

async function getRemoteDefaultBranch(cloneUrl: string): Promise<string> {
  return (await getRemoteRepoInfo(cloneUrl)).defaultBranch;
}

/**
 * Updates an existing repository to the latest commit on the default branch.
 * Handles cases where the default branch has changed on the remote.
 */
async function updateRepository(repo: RepositoryData): Promise<boolean> {
  const repoPath = join(REPOS_DIR, repo.fullName);

  try {
    // Get the current default branch from the remote
    const defaultBranch = await getRemoteDefaultBranch(repo.cloneUrl);

    // Fetch the latest from the default branch (shallow fetch to FETCH_HEAD)
    await execa("git", ["fetch", "--depth", "1", "origin", defaultBranch], {
      cwd: repoPath,
    });

    // Reset to the fetched commit (FETCH_HEAD)
    await execa("git", ["reset", "--hard", "FETCH_HEAD"], {
      cwd: repoPath,
    });

    console.log(`Updated ${repo.fullName} (branch: ${defaultBranch})`);
    return true;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`Failed to update ${repo.fullName}: ${message}`);
    // If update fails, try a fresh clone
    console.log(`Attempting fresh clone of ${repo.fullName}...`);
    rmSync(repoPath, { recursive: true, force: true });
    return cloneRepository(repo);
  }
}

/**
 * Clones a repository to the local repos directory.
 * Uses shallow clone (depth=1) to save disk space and time.
 */
async function cloneRepository(repo: RepositoryData): Promise<boolean> {
  const repoPath = join(REPOS_DIR, repo.fullName);

  // Ensure parent directory exists
  const parentDir = join(REPOS_DIR, repo.fullName.split("/")[0]);
  if (!existsSync(parentDir)) {
    mkdirSync(parentDir, { recursive: true });
  }

  try {
    await execa("git", ["clone", "--depth", "1", repo.cloneUrl, repoPath]);
    console.log(`Cloned ${repo.fullName}`);
    return true;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`Failed to clone ${repo.fullName}: ${message}`);
    return false;
  }
}

/**
 * Clones or updates a repository depending on whether it already exists.
 */
async function cloneOrUpdateRepository(repo: RepositoryData): Promise<boolean> {
  const repoPath = join(REPOS_DIR, repo.fullName);

  if (existsSync(repoPath)) {
    return updateRepository(repo);
  }
  return cloneRepository(repo);
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

  let repositoriesToCloneOrUpdate: RepositoryData[] = [];

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
      if (repositoriesToCloneOrUpdate.length >= oldestAnalyzedLimit) {
        break;
      }
      checkedCount++;
      if (await hasNewCommits(repo.fullName, analysis)) {
        repositoriesToCloneOrUpdate.push(repo);
        console.log(
          `  [${repositoriesToCloneOrUpdate.length}/${oldestAnalyzedLimit}] ${repo.fullName} - has new commits`,
        );
      } else {
        upToDateCount++;
        console.log(`  [skip] ${repo.fullName} - already up-to-date`);
      }
    }

    console.log(`\nChecked ${checkedCount} repos`);
    console.log(`Repos already up-to-date: ${upToDateCount}`);
    console.log(
      `Selected ${repositoriesToCloneOrUpdate.length} repos with new commits`,
    );
  } else {
    repositoriesToCloneOrUpdate = data.repositories;

    console.log(`Total repositories: ${data.repositories.length}`);
  }

  if (repositoriesToCloneOrUpdate.length === 0) {
    console.log("All repositories are already cloned.");
    return;
  }

  let success = 0;
  let failed = 0;
  let index = 0;

  async function worker(): Promise<void> {
    while (index < repositoriesToCloneOrUpdate.length) {
      const repo = repositoriesToCloneOrUpdate[index++];
      const result = await cloneOrUpdateRepository(repo);
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
  console.log(`Successfully cloned/updated: ${success}`);
  console.log(`Failed: ${failed}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

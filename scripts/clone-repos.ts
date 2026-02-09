import { ensureDirSync } from "fs-extra/esm";
import PQueue from "p-queue";
import type { AnalysisResult, RepositoryData } from "@/lib/types";
import { checkoutRepository } from "@/lib/git";
import { octokit } from "@/lib/octokit";
import { loadAnalysis, loadData, REPOS_DIR } from "@/lib/types";

const CLONE_CONCURRENCY = 5;

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
  ensureDirSync(REPOS_DIR);

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

  const queue = new PQueue({ concurrency: CLONE_CONCURRENCY });

  let count = 0;
  await Promise.all(
    repositoriesToCloneOrUpdate.map((repo) =>
      queue.add(async () => {
        await checkoutRepository(repo);
        count += 1;
        console.log(
          `[${count}/${repositoriesToCloneOrUpdate.length}] Done: ${repo.fullName}`,
        );
      }),
    ),
  );

  console.log(`Done.`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

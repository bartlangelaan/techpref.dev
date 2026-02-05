import { uniqBy } from "es-toolkit";
import type { RepositoryData, UnifiedData } from "@/lib/types";
import { octokit } from "@/lib/octokit";
import { loadData, saveData } from "@/lib/types";

const REPO_COUNT = 1000;

/**
 * Sleep for a given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetches the top TypeScript repositories from GitHub sorted by stars.
 * GitHub's search API returns max 1000 results (100 per page, 10 pages max).
 * Includes retry logic for rate limit errors.
 */
async function fetchTopTypeScriptRepos(
  count: number = 1000,
): Promise<RepositoryData[]> {
  const repos: RepositoryData[] = [];
  const perPage = 100;
  const totalPages = Math.ceil(Math.min(count, 1000) / perPage);

  console.log(`Fetching top ${count} TypeScript repositories from GitHub...`);

  for (let page = 1; page <= totalPages; page++) {
    console.log(`Fetching page ${page}/${totalPages}...`);

    const response = await octokit.search.repos({
      q: "language:typescript",
      sort: "stars",
      order: "desc",
      per_page: perPage,
      page,
    });

    for (const repo of response.data.items) {
      repos.push({
        fullName: repo.full_name,
        cloneUrl: repo.clone_url,
        stars: repo.stargazers_count,
        description: repo.description,
      });

      if (repos.length >= count) {
        break;
      }
    }

    // Respect rate limiting - wait between requests
    if (page < totalPages) {
      await sleep(2000); // Increased to 2 seconds between requests
    }
  }

  console.log(`Fetched ${repos.length} repositories.`);
  // Deduplicate by fullName in case of unexpected duplicates from the API
  const deduped = uniqBy(repos, (r) => r.fullName);
  if (deduped.length !== repos.length) {
    console.log(
      `Removed ${repos.length - deduped.length} duplicate repositories from fetched results.`,
    );
  }
  // Sort by stars in descending order
  return deduped.sort((a, b) => b.stars - a.stars);
}
/**
 * Merge freshly fetched repos with existing data, preserving clone and analysis state.
 * Also preserves old repositories that are no longer in the top results from GitHub.
 * Final list is sorted by stars in descending order.
 */
function mergeRepos(
  freshRepos: RepositoryData[],
  existingData: UnifiedData | null,
): RepositoryData[] {
  if (!existingData) {
    return freshRepos.sort((a, b) => b.stars - a.stars);
  }

  // Create a map of fresh repos by fullName for fast lookup
  const freshMap = new Map<string, RepositoryData>();
  for (const repo of freshRepos) {
    freshMap.set(repo.fullName, repo);
  }

  // Merge: update fresh repos with existing clone/analysis state, keep old repos not in fresh results
  const merged: RepositoryData[] = [];

  // First, add all fresh repos with preserved clone/analysis state
  for (const fresh of freshRepos) {
    merged.push(fresh);
  }

  // Then, add old repos that are no longer in fresh results
  for (const old of existingData.repositories) {
    if (!freshMap.has(old.fullName)) {
      merged.push(old);
    }
  }

  // Ensure final list has no duplicates (in case existing data had duplicates)
  const final = uniqBy(merged, (r) => r.fullName);
  if (final.length !== merged.length) {
    console.log(
      `Removed ${merged.length - final.length} duplicate repositories during merge.`,
    );
  }

  // Sort by stars in descending order
  return final.sort((a, b) => b.stars - a.stars);
}

async function main() {
  console.log("=== TechPref Repository Fetcher ===\n");

  if (!process.env.GITHUB_TOKEN) {
    console.warn(
      "Warning: GITHUB_TOKEN not set. API rate limits will be very restrictive.\n" +
        "Set GITHUB_TOKEN environment variable for better performance.\n",
    );
  }

  // Load existing data to preserve clone/analysis state
  const existingData = loadData();
  if (existingData) {
    console.log(
      `Found existing data with ${existingData.repositories.length} repositories.`,
    );
  }

  // Fetch fresh data from GitHub
  const freshRepos = await fetchTopTypeScriptRepos(REPO_COUNT);

  // Merge with existing data
  const mergedRepos = mergeRepos(freshRepos, existingData);

  console.log(`\nMerged data:`);
  console.log(`  Total repositories: ${mergedRepos.length}`);

  // Save unified data
  const data: UnifiedData = {
    fetchedAt: new Date().toISOString(),
    repositories: mergedRepos,
  };
  saveData(data);

  console.log(`\nTop 5 repositories by stars:`);
  for (const repo of mergedRepos.slice(0, 5)) {
    console.log(`  ${repo.fullName} (${repo.stars.toLocaleString()} stars)`);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

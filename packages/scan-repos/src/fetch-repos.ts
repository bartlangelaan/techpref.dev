import { Octokit } from "@octokit/rest";
import {
  loadData,
  saveData,
  type RepositoryData,
  type UnifiedData,
} from "./data.js";

const REPO_COUNT = 1000;

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

/**
 * Fetches the top TypeScript repositories from GitHub sorted by stars.
 * GitHub's search API returns max 1000 results (100 per page, 10 pages max).
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
        clonedAt: null,
        analysis: null,
      });

      if (repos.length >= count) {
        break;
      }
    }

    // Respect rate limiting - wait between requests
    if (page < totalPages) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log(`Fetched ${repos.length} repositories.`);
  return repos;
}

/**
 * Merge freshly fetched repos with existing data, preserving clone and analysis state.
 */
function mergeRepos(
  freshRepos: RepositoryData[],
  existingData: UnifiedData | null,
): RepositoryData[] {
  if (!existingData) {
    return freshRepos;
  }

  // Create a map of existing repos by fullName for fast lookup
  const existingMap = new Map<string, RepositoryData>();
  for (const repo of existingData.repositories) {
    existingMap.set(repo.fullName, repo);
  }

  // Merge: use fresh data but preserve clonedAt and analysis from existing
  return freshRepos.map((fresh) => {
    const existing = existingMap.get(fresh.fullName);
    if (existing) {
      return {
        ...fresh,
        clonedAt: existing.clonedAt,
        analysis: existing.analysis,
      };
    }
    return fresh;
  });
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

  // Count preserved states
  const clonedCount = mergedRepos.filter((r) => r.clonedAt).length;
  const analyzedCount = mergedRepos.filter((r) => r.analysis).length;

  console.log(`\nMerged data:`);
  console.log(`  Total repositories: ${mergedRepos.length}`);
  console.log(`  Already cloned: ${clonedCount}`);
  console.log(`  Already analyzed: ${analyzedCount}`);

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

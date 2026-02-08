import { uniqBy } from "es-toolkit";
import type { RepositoryData, UnifiedData } from "@/lib/types";
import { octokit } from "@/lib/octokit";
import { saveData } from "@/lib/types";

const REPO_COUNT = 1000;

/**
 * Fetches the top TypeScript repositories from GitHub sorted by stars.
 * GitHub's search API returns max 1000 results (100 per page, 10 pages max).
 * Includes retry logic for rate limit errors.
 */
async function fetchTopTypeScriptRepos(
  count: number,
): Promise<RepositoryData[]> {
  const repos: RepositoryData[] = [];
  const perPage = 100;
  const totalPages = Math.ceil(Math.min(count, 1000) / perPage);

  console.log(`Fetching top ${count} TypeScript repositories from GitHub...`);

  for (let page = 1; page <= totalPages; page++) {
    console.log(`Fetching page ${page}/${totalPages}...`);

    // We use the same query as the typescript bot.
    // See: https://github.com/microsoft/typescript-error-deltas/blob/4d2e0801127c2a9140cb579e79c153d85c486a32/src/utils/gitUtils.ts#L42
    const response = await octokit.search.repos({
      q: "language:typescript+stars:>100 archived:no",
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

async function main() {
  console.log("=== TechPref Repository Fetcher ===\n");

  if (!process.env.GITHUB_TOKEN) {
    console.warn(
      "Warning: GITHUB_TOKEN not set. API rate limits will be very restrictive.\n" +
        "Set GITHUB_TOKEN environment variable for better performance.\n",
    );
  }

  // Fetch fresh data from GitHub
  const repositories = await fetchTopTypeScriptRepos(REPO_COUNT);

  console.log(`Total repositories: ${repositories.length}`);

  // Save unified data
  const data: UnifiedData = {
    fetchedAt: new Date().toISOString(),
    repositories: repositories,
  };
  saveData(data);

  console.log(`\nTop 5 repositories by stars:`);
  for (const repo of repositories.slice(0, 5)) {
    console.log(`  ${repo.fullName} (${repo.stars.toLocaleString()} stars)`);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

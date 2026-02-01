import type { RepositoryData, UnifiedData } from "@/lib/types";
import { loadData, saveData } from "@/lib/types";
import { Octokit } from "@octokit/rest";

const REPO_COUNT = 1000;
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY_MS = 60_000; // Start with 1 minute

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

/**
 * Sleep for a given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if an error is a rate limit error.
 */
function isRateLimitError(error: unknown): boolean {
  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    "message" in error
  ) {
    const status = error.status;
    const message = String(error.message);
    return (
      status === 403 ||
      status === 429 ||
      message.toLowerCase().includes("rate limit")
    );
  }
  return false;
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

    let response;
    let retries = 0;

    while (true) {
      try {
        response = await octokit.search.repos({
          q: "language:typescript",
          sort: "stars",
          order: "desc",
          per_page: perPage,
          page,
        });
        break; // Success, exit retry loop
      } catch (error) {
        if (isRateLimitError(error) && retries < MAX_RETRIES) {
          retries++;
          const delayMs = INITIAL_RETRY_DELAY_MS * Math.pow(2, retries - 1);
          const delayMinutes = Math.round(delayMs / 60_000);
          console.log(
            `Rate limit hit. Waiting ${delayMinutes} minute(s) before retry ${retries}/${MAX_RETRIES}...`,
          );
          await sleep(delayMs);
        } else {
          throw error;
        }
      }
    }

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
      await sleep(2000); // Increased to 2 seconds between requests
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

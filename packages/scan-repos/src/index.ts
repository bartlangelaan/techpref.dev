import { cloneRepositories } from "./clone.js";
import {
  fetchTopTypeScriptRepos,
  loadRepositories,
  saveRepositories,
} from "./github.js";

const REPO_COUNT = 1000;
const CLONE_CONCURRENCY = 5;

async function main() {
  console.log("=== TechPref Repository Scanner ===\n");

  // Try to load from cache first
  let repos = loadRepositories();

  if (repos) {
    console.log("Using cached repository list.\n");
  } else {
    if (!process.env.GITHUB_TOKEN) {
      console.warn(
        "Warning: GITHUB_TOKEN not set. API rate limits will be very restrictive.\n" +
          "Set GITHUB_TOKEN environment variable for better performance.\n",
      );
    }

    // Fetch top repositories from GitHub
    repos = await fetchTopTypeScriptRepos(REPO_COUNT);

    // Save to cache for future runs
    saveRepositories(repos);
  }

  console.log(`\nTop 5 repositories by stars:`);
  for (const repo of repos.slice(0, 5)) {
    console.log(`  ${repo.fullName} (${repo.stars.toLocaleString()} stars)`);
  }

  // Clone repositories
  console.log(`\nCloning ${repos.length} repositories...\n`);
  const { success, failed } = await cloneRepositories(repos, CLONE_CONCURRENCY);

  console.log(`\n=== Summary ===`);
  console.log(`Successfully cloned: ${success}`);
  console.log(`Failed: ${failed}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

import { loadRepositories } from "./github.js";
import { analyzeRepositories } from "./analyze.js";

async function main() {
  console.log("=== TechPref Repository Analyzer ===\n");

  // Load repositories from cache
  const repos = loadRepositories();

  if (!repos) {
    console.error(
      "No repositories found. Run 'pnpm start' first to fetch and clone repositories."
    );
    process.exit(1);
  }

  console.log(`\nStarting analysis of ${repos.length} repositories...\n`);

  await analyzeRepositories(repos);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

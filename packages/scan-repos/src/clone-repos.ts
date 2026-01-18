import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { loadData, REPOS_DIR, saveData, type RepositoryData } from "./data.js";

const CLONE_CONCURRENCY = 5;

/**
 * Clones a repository to the local repos directory.
 * Uses shallow clone (depth=1) to save disk space and time.
 */
async function cloneRepository(repo: RepositoryData): Promise<boolean> {
  const repoPath = join(REPOS_DIR, repo.fullName);

  if (existsSync(repoPath)) {
    console.log(`Skipping ${repo.fullName} (already exists on disk)`);
    return true;
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

async function main() {
  console.log("=== TechPref Repository Cloner ===\n");

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

  // Filter repos that need cloning (clonedAt is null)
  const reposToClone = data.repositories.filter((r) => r.clonedAt === null);

  console.log(`Total repositories: ${data.repositories.length}`);
  console.log(`Already cloned: ${data.repositories.length - reposToClone.length}`);
  console.log(`To clone: ${reposToClone.length}\n`);

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
        // Update clonedAt timestamp
        repo.clonedAt = new Date().toISOString();
        // Save after each successful clone to preserve progress
        saveData(data);
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

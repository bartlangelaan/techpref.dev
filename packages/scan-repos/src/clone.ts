import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { Repository } from "./github.js";

const REPOS_DIR = join(process.cwd(), "repos");

/**
 * Clones a repository to the local repos directory.
 * Uses shallow clone (depth=1) to save disk space and time.
 */
export async function cloneRepository(repo: Repository): Promise<boolean> {
  const repoPath = join(REPOS_DIR, repo.fullName);

  if (existsSync(repoPath)) {
    console.log(`Skipping ${repo.fullName} (already exists)`);
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

/**
 * Clones multiple repositories with concurrency control.
 */
export async function cloneRepositories(
  repos: Repository[],
  concurrency: number = 5,
): Promise<{ success: number; failed: number }> {
  if (!existsSync(REPOS_DIR)) {
    mkdirSync(REPOS_DIR, { recursive: true });
  }

  let success = 0;
  let failed = 0;
  let index = 0;

  async function worker(): Promise<void> {
    while (index < repos.length) {
      const repo = repos[index++];
      const result = await cloneRepository(repo);
      if (result) {
        success++;
      } else {
        failed++;
      }
    }
  }

  // Start workers
  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  return { success, failed };
}

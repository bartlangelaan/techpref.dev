import { execa } from "execa";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { REPOS_DIR, RepositoryData } from "./types";
import { pathExists } from "./utils";

/**
 * Get the default branch name and latest commit SHA from the remote repository.
 * Uses ls-remote to check what HEAD points to on the remote.
 */
export async function getRemoteRepoInfo(cloneUrl: string) {
  const { stdout } = await execa("git", [
    "ls-remote",
    "--symref",
    cloneUrl,
    "HEAD",
  ]);
  // Output format: "ref: refs/heads/main\tHEAD\n<sha>\tHEAD"
  const match = stdout.match(/ref: refs\/heads\/(.*)\tHEAD\n(.*)\tHEAD/);
  if (!match) {
    throw new Error(`Failed to determine default branch for ${cloneUrl}`);
  }

  return { defaultBranch: match[1], latestCommit: match[2] };
}

/**
 * Should clone or update the repository to the latest commit on the default
 * branch. Handles cases where the default branch has changed on the remote.
 */
export async function checkoutRepository(
  repo: RepositoryData,
  remoteRepoInfo?: Awaited<ReturnType<typeof getRemoteRepoInfo>>,
) {
  const repoPath = join(REPOS_DIR, repo.fullName);

  const exists = await pathExists(repoPath);

  if (!exists) {
    const parentDir = join(repoPath, "..");
    if (!(await pathExists(parentDir))) {
      await mkdir(parentDir, { recursive: true });
    }

    await execa("git", ["clone", "--depth", "1", repo.cloneUrl, repoPath]);
    return;
  }

  remoteRepoInfo ??= await getRemoteRepoInfo(repo.cloneUrl);

  await execa(
    "git",
    ["fetch", "--depth", "1", "origin", remoteRepoInfo.defaultBranch],
    {
      cwd: repoPath,
    },
  );

  // Reset to the fetched commit (FETCH_HEAD)
  await execa("git", ["reset", "--hard", "FETCH_HEAD"], {
    cwd: repoPath,
  });
}

import { execa } from "execa";
import { ensureDir, pathExists, remove } from "fs-extra/esm";
import { join } from "node:path";
import { REPOS_DIR, RepositoryData } from "./types";

/**
 * Check if there are any uncommitted changes in the repository.
 */
export async function hasUncommittedChanges(
  repoPath: string,
): Promise<boolean> {
  const { stdout } = await execa("git", ["status", "--porcelain"], {
    cwd: repoPath,
  });
  return !!stdout.length;
}

/**
 * Pull with rebase to get latest changes from remote.
 * If the rebase fails due to conflicts, it will abort the rebase.
 */
export async function pullRebase(repoPath: string): Promise<void> {
  try {
    await execa("git", ["pull", "--rebase"], {
      cwd: repoPath,
    });
  } catch (error) {
    // If rebase fails, abort it and throw
    await execa("git", ["rebase", "--abort"], {
      cwd: repoPath,
      reject: false,
    });
    throw error;
  }
}

/**
 * Stage all changes, commit with a message, and push.
 * Uses rebase before pushing to handle concurrent updates.
 * Returns true if changes were committed and pushed, false if there were no changes.
 */
export async function commit(repoPath: string, message: string) {
  // Check if there are changes to commit
  if (!(await hasUncommittedChanges(repoPath))) {
    return false;
  }

  await execa("git", ["add", "-A"], {
    cwd: repoPath,
  });

  await execa("git", ["commit", "-m", message], {
    cwd: repoPath,
    env: { HUSKY: "0" },
  });
}

export async function push(repoPath: string) {
  await pullRebase(repoPath);

  await execa("git", ["push"], {
    cwd: repoPath,
    verbose: "full",
  });
}

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
 * Get the current git commit hash from a repository.
 */
export async function getCheckoutCommit(repoPath: string): Promise<string> {
  const { stdout } = await execa("git", ["rev-parse", "HEAD"], {
    cwd: repoPath,
  });
  return stdout;
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
    await ensureDir(join(repoPath, ".."));
    await execa("git", ["clone", "--depth", "1", repo.cloneUrl, repoPath]);
    return;
  }

  const checkoutCommitPromise = getCheckoutCommit(repoPath);

  remoteRepoInfo ??= await getRemoteRepoInfo(repo.cloneUrl);

  if ((await checkoutCommitPromise) === remoteRepoInfo.latestCommit) {
    // Already up to date, no need to fetch
    return;
  }

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

/**
 * Remove a cloned repository from the repos directory.
 */
export async function removeRepository(fullName: string): Promise<void> {
  const repoPath = join(REPOS_DIR, fullName);
  await remove(repoPath);
}

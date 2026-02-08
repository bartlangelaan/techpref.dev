import { execa } from "execa";

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

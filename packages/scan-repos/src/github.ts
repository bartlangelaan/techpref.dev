import { Octokit } from "@octokit/rest";

export interface Repository {
  fullName: string;
  cloneUrl: string;
  stars: number;
  description: string | null;
}

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

/**
 * Fetches the top TypeScript repositories from GitHub sorted by stars.
 * GitHub's search API returns max 1000 results (100 per page, 10 pages max).
 */
export async function fetchTopTypeScriptRepos(
  count: number = 1000
): Promise<Repository[]> {
  const repos: Repository[] = [];
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

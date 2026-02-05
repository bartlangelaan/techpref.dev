import { throttling } from "@octokit/plugin-throttling";
import { Octokit } from "@octokit/rest";

const MyOctokit = Octokit.plugin(throttling);
export const octokit = new MyOctokit({
  auth: process.env.GITHUB_TOKEN,
  throttle: {
    onRateLimit: (retryAfter, options, octokit, retryCount) => {
      octokit.log.warn(
        `Request quota exhausted for request ${options.method} ${options.url} - waiting ${retryAfter} seconds before retrying... (Retry count: ${retryCount})`,
      );
      return true;
    },
    onSecondaryRateLimit: (retryAfter, options, octokit) => {
      octokit.log.warn(
        `SecondaryRateLimit detected for request ${options.method} ${options.url} - waiting ${retryAfter} seconds before retrying...`,
      );
      return true;
    },
  },
});

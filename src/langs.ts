import git from "./git";
import { GitHubAPI } from "probot/lib/github";
import { Context } from "probot";
import execa from "execa";

/**
 * Build language files
 */
export const buildLangs = async (context: Context) => {
  const { repository, issue } = context.payload;

  context.github.issues.createComment(
    context.issue({ body: "Got it! Building language files now 🌐️" })
  );

  const pullRequestInfo = await context.github.pullRequests.get({
    owner: repository.owner.login,
    repo: repository.name,
    number: issue.number
  });

  context.log.debug(`Cloning ${repository.clone_url}...`);

  await git.clone({
    dir: `./.repos/${repository.name}`,
    url: repository.clone_url,
    singleBranch: true,
    ref: pullRequestInfo.data.head.ref,
    depth: 1
  });

  context.log.debug(`Cloning of ${repository.clone_url} done`);

  context.log.debug(`Installing dependencies ${repository.clone_url}`);
  await execa("npm", ["install", "-g", "babel-cli"]);
  await execa("npm", ["install"]);
  context.log.debug(`Installing dependencies ${repository.clone_url} done`);

  context.log.debug(`Building language files`);
  await execa("npm", ["run", "langs:build"]);
  const { stdout } = await execa("npm", ["run", "langs:translate"]);
  context.log.debug(`Building language files done! Output log: ${stdout}`);

  context.log.debug(`Commiting result...`);
  context.log.debug(`All done!`);
};

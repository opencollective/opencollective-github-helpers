import { Application, Context } from "probot";
import { buildLangs } from "./langs";

const replyComment = async (context: Context, message: string) => {
  return context.github.issues.createComment(context.issue({ body: message }));
};

type TCommands = { [command: string]: (context: Context) => any };

const commands: TCommands = {
  "build:langs": buildLangs
};

/**
 * Main Application
 */
export = (app: Application) => {
  const commandPrefix = "/helpers";
  app.on("issue_comment.created", async context => {
    const { repository, issue, comment } = context.payload;
    const isPullRequest = Boolean(issue.pull_request);
    if (isPullRequest && comment.body.startsWith(commandPrefix)) {
      const command = comment.body.replace(commandPrefix, "").trim();
      context.log.info(`Received command: ${command}`);
      if (commands[command]) {
        try {
          await commands[command](context);
        } catch (e) {
          context.log.error(e.message ? e.message : e);
          replyComment(context, `Command failed, see logs.`);
        }
      } else {
        replyComment(context, `Unknown command: ${command}`);
      }
    }
  });
};

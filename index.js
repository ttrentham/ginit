#!/usr/bin/env node

import { readFile } from "fs/promises";
const pkg = JSON.parse(
  await readFile(new URL("./package.json", import.meta.url))
);

import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import { program } from "commander";

import {
  getRemoteReposforOrg,
  getMilestoneIssues,
  getPullRequests,
} from "./lib/repo.js";

import { copyTeamPermissions } from "./lib/team.js";
import { getProjectsforOrg } from "./lib/project.js";

import { askGithubOrg } from "./lib/inquirer.js";

import { getFilterDaysAgo } from "./lib/utils.js";

// clear the screen
clear();

// display fancy splash title
console.log(
  chalk.yellow(figlet.textSync("GhTools", { horizontalLayout: "full" }))
);

program
  .version(pkg.version)
  .description(pkg.description)
  .arguments("[org] [source] [destination]")
  .option("-p, --public-count", "Count public github repos and projects")
  .option("-c, --copy-team-permissions", "Copy team repository permissions")
  .parse(process.argv);

const run = async () => {
  try {
    let countPublic,
      copyTeams = false,
      listMilestone,
      showUserActivity;

    let organization, sourceTeam, destTeam, repository, milestone, author;

    // allowing for either command-line or interactive input
    if (program.args.length) {
      organization = orgValue;
      countPublic = program.publicCount;
      copyTeams = program.copyTeamPermissions;
      sourceTeam = sourceValue;
      destTeam = destValue;
    } else {
      const answersOrg = await askGithubOrg();
      countPublic = answersOrg.chooseAction == "Count";
      copyTeams = answersOrg.chooseAction == "CopyPerms";
      organization = answersOrg.organization;
      sourceTeam = answersOrg.source;
      destTeam = answersOrg.destination;
      listMilestone = answersOrg.chooseAction == "MilestoneIssues";
      repository = answersOrg.repositoryName;
      milestone = answersOrg.milestoneNum;
      showUserActivity = answersOrg.chooseAction == "UserActivity";
      author = answersOrg.userName;
    }

    if (countPublic) {
      const repos = await getRemoteReposforOrg(organization);
      const publicRepos = repos.filter((repo) => !repo.private);
      console.log(
        "There are %d public repositories in the %s organization.",
        publicRepos.length,
        organization
      );

      const projects = await getProjectsforOrg(organization);
      const publicProjects = projects.filter((project) => !project.private);
      console.log(
        "There are %d public projects in the %s organization.",
        publicProjects.length,
        organization
      );
    }

    if (copyTeams)
      await copyTeamPermissions(organization, sourceTeam, destTeam);

    if (listMilestone) {
      const issues = await getMilestoneIssues(
        organization,
        repository,
        milestone
      );
      console.log(JSON.stringify(issues, null, 2));
    }

    if (showUserActivity) {
      const prs = await getPullRequests(
        organization,
        author,
        getFilterDaysAgo()
      );
      console.log(JSON.stringify(prs, null, 2));
    }

    console.log("Nothing else to do! Exiting....");
  } catch (err) {
    if (err) {
      switch (err.status) {
        case 400:
          console.log(
            chalk.red(
              "Bad request - Message: " +
                err.message +
                " - Url: " +
                err.request.url
            )
          );
          break;
        case 401:
          console.log(
            chalk.red(
              "Unauthorized. Likely a bad token - Message: " + err.message
            )
          );
          break;
        case 403:
          console.log(
            chalk.red(
              "Forbidden - Message: " +
                err.message +
                " - Url: " +
                err.request.url
            )
          );
          break;
        case 404:
          console.log(chalk.red(err.message + " - Url: " + err.request.url));
          break;
        case 422:
          console.log(
            chalk.red(
              "Unprocessable Entity - may already exist or may not be accessible. Message: " +
                err.message +
                " - Url: " +
                err.request.url
            )
          );
          break;
        default:
          console.log(err);
      }
      process.exit(1);
    }
  }
  process.exit(0);
};

run();

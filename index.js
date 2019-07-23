#!/usr/bin/env node

const chalk = require("chalk");
const clear = require("clear");
const figlet = require("figlet");

const github = require("./lib/github");
const repo = require("./lib/repo");
const team = require("./lib/team");
const project = require("./lib/project");
const files = require("./lib/files");

const inquirer = require("./lib/inquirer");

clear();
console.log(
  chalk.yellow(figlet.textSync("GhTools", { horizontalLayout: "full" }))
);

const run = async () => {
  try {
    const answersOrg = await inquirer.askGithubOrg();

    if (answersOrg.countPublic) {
      const repos = await repo.getRemoteReposforOrg(answersOrg.organization);
      const publicRepos = repos.filter(repo => !repo.private);
      console.log(
        "There are %d public repositories in the %s organization.",
        publicRepos.length,
        answersOrg.organization
      );

      const projects = await project.getProjectsforOrg(answersOrg.organization);
      const publicProjects = projects.filter(project => !project.private);
      console.log(
        "There are %d public projects in the %s organization.",
        publicProjects.length,
        answersOrg.organization
      );
    }

    if (answersOrg.useteams)
      await team.copyTeamPermissions(
        answersOrg.organization,
        answersOrg.source,
        answersOrg.destination
      );

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
          console.log(
            chalk.red(
              "Not Found - Message: " +
                err.message +
                " - Url: " +
                err.request.url
            )
          );
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

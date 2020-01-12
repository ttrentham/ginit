#!/usr/bin/env node

const { version, description } = require("./package.json");
const chalk = require("chalk");
const clear = require("clear");
const figlet = require("figlet");
const program = require("commander");

const repo = require("./lib/repo");
const team = require("./lib/team");
const project = require("./lib/project");

const inquirer = require("./lib/inquirer");

// clear the screen
clear();

// display fancy splash title
console.log(
  chalk.yellow(figlet.textSync("GhTools", { horizontalLayout: "full" }))
);

program
  .version(version)
  .description(description)
  .arguments("<org> [source] [destination]")
  .action(function(org, source, destination) {
    orgValue = org;
    sourceValue = source;
    destValue = destination;
  })
  .option("-p, --public-count", "Count public github repos and projects")
  .option("-c, --copy-team-permissions", "Copy team repository permissions")
  .parse(process.argv);

const run = async () => {
  try {
    let countPublic,
      copyTeams = false;
    let organization, sourceTeam, destTeam;

    // allowing for either command-line or interactive input
    if (program.args.length) {
      organization = orgValue;
      countPublic = program.publicCount;
      copyTeams = program.copyTeamPermissions;
      sourceTeam = sourceValue;
      destTeam = destValue;
    } else {
      const answersOrg = await inquirer.askGithubOrg();
      countPublic = answersOrg.countPublic;
      copyTeams = answersOrg.copyTeams;
      organization = answersOrg.organization;
      sourceTeam = answersOrg.source;
      destTeam = answersOrg.destination;
      listMilestone = answersOrg.issuesInMilestone;
      repository = answersOrg.repositoryName;
      milestone = answersOrg.milestoneNum;
    }

    if (countPublic) {
      const repos = await repo.getRemoteReposforOrg(organization);
      const publicRepos = repos.filter(repo => !repo.private);
      console.log(
        "There are %d public repositories in the %s organization.",
        publicRepos.length,
        organization
      );

      const projects = await project.getProjectsforOrg(organization);
      const publicProjects = projects.filter(project => !project.private);
      console.log(
        "There are %d public projects in the %s organization.",
        publicProjects.length,
        organization
      );
    }

    if (copyTeams)
      await team.copyTeamPermissions(organization, sourceTeam, destTeam);

    if (listMilestone) {
      const issues = await repo.getMilestoneIssues(
        organization,
        repository,
        milestone
      );
      console.log(issues);
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

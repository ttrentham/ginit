#!/usr/bin/env node

const chalk       = require('chalk');
const clear       = require('clear');
const figlet      = require('figlet');

const github       = require('./lib/github');
const repo         = require('./lib/repo');
const files        = require('./lib/files');

const inquirer    = require('./lib/inquirer');

clear();
console.log(
  chalk.yellow(
    figlet.textSync('GhTools', { horizontalLayout: 'full' })
  )
);

const getGithubToken = async () => {
  // Fetch token from config store
  let token = github.getStoredGithubToken();
  if(token) {
    return token;
  }

  // No token found, use credentials to access github account
  await github.setGithubCredentials();

  // Check if access token for ginit was registered
  const accessToken = await github.hasAccessToken();
  if(accessToken) {
    console.log(chalk.yellow('An existing access token has been found!'));
    // ask user to regenerate a new token
    token = await github.regenerateNewToken(accessToken.id);
    return token;
  }

  // No access token found, register one now
  token = await github.registerNewToken();
  return token;
}


const run = async () => {
  try {
    const answers = await inquirer.askGithubOrg();

    const repos = await repo.getRemoteReposforOrg(answers.organization);

    let result = repos.map(a => a.name);

    console.log(result);

  } catch(err) {
      if (err) {
        switch (err.status) {
          case 401:
            console.log(chalk.red('Couldn\'t log you in. Please provide correct credentials/token.'));
            break;
          case 422:
            console.log(chalk.red('There already exists a remote repository with the same name'));
            break;
          default:
            console.log(err);
        }
        process.exit(1);
      }
  }
}

run();

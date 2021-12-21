import _ from "lodash";
import fs from "fs";
import git from "simple-git";
import CLI from "clui";
const Spinner = CLI.Spinner;
import touch from "touch";

import { askRepoDetails } from "./inquirer.js";
import { getInstance, getGqlInstance } from "./github.js";

export const getPullRequests = async (organization, author, created) => {
  const gql = getGqlInstance();
  const query = `{
      search(query: "org:${organization} is:pr archived:false author:${author} created:${created}", type: ISSUE, first: 100) {
        issueCount
        edges {
          node {
            ... on PullRequest {
              number
              title
              repository {
                nameWithOwner
              }
              createdAt
              mergedAt
              url
              changedFiles
              additions
              deletions
            }
          }
        }
      }
    }
    `;

  const result = await gql(query);

  return result;
};

export const getMilestoneIssues = async (
  organization,
  repository,
  milestone
) => {
  const gql = getGqlInstance();
  const query = `{
          organization(login: "${organization}") {
            repository(name: "${repository}") {
              milestone(number: ${milestone}) {
                title
                dueOn
                issues(first: 50) {
                  totalCount
                  nodes {
                    number
                    title
                    createdAt
                  }
                }
              }
            }
          }
        }`;
  const result = await gql(query);

  return result;
};

export const getRemoteReposforOrg = async (organization) => {
  const github = getInstance();

  const data = {
    org: organization,
  };

  const status = new Spinner("Getting " + organization + " repositories...");
  status.start();

  try {
    const options = github.repos.listForOrg.endpoint.merge(data);
    const repos = await github.paginate(options);
    return repos;
  } catch (err) {
    throw err;
  } finally {
    status.stop();
  }
};

export const createRemoteRepo = async () => {
  const github = getInstance();
  const answers = await askRepoDetails();

  const data = {
    name: answers.name,
    description: answers.description,
    private: answers.visibility === "private",
  };

  const status = new Spinner("Creating remote repository...");
  status.start();

  try {
    const response = await github.repos.create(data);
    return response.data.ssh_url;
  } catch (err) {
    throw err;
  } finally {
    status.stop();
  }
};

export const createGitignore = async () => {
  const filelist = _.without(fs.readdirSync("."), ".git", ".gitignore");

  if (filelist.length) {
    const answers = await inquirer.askIgnoreFiles(filelist);
    if (answers.ignore.length) {
      fs.writeFileSync(".gitignore", answers.ignore.join("\n"));
    } else {
      touch(".gitignore");
    }
  } else {
    touch(".gitignore");
  }
};

export const setupRepo = async (url) => {
  const status = new Spinner(
    "Initializing local repository and pushing to remote..."
  );
  status.start();

  try {
    await git
      .init()
      .add(".gitignore")
      .add("./*")
      .commit("Initial commit")
      .addRemote("origin", url)
      .push("origin", "master");
    return true;
  } catch (err) {
    throw err;
  } finally {
    status.stop();
  }
};

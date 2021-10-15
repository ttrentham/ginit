const _ = require("lodash");
const fs = require("fs");
const git = require("simple-git")();
const CLI = require("clui");
const Spinner = CLI.Spinner;
const touch = require("touch");

const inquirer = require("./inquirer");
const gh = require("./github");

module.exports = {
  getPullRequests: async (author, created) => {
    const gql = gh.getGqlInstance();
    const query = `{
      search(query: "org:blacklocus is:pr archived:false author:${author} created:${created}", type: ISSUE, first: 100) {
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
  },

  getMilestoneIssues: async (organization, repository, milestone) => {
    const gql = gh.getGqlInstance();
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
  },

  getRemoteReposforOrg: async (organization) => {
    const github = gh.getInstance();

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
  },

  createRemoteRepo: async () => {
    const github = gh.getInstance();
    const answers = await inquirer.askRepoDetails();

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
  },

  createGitignore: async () => {
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
  },

  setupRepo: async (url) => {
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
  },
};

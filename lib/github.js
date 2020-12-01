const { Octokit } = require("@octokit/rest");
const { graphql } = require("@octokit/graphql");

module.exports = {
  getInstance: () => {
    // add log:console for additional logging here
    return new Octokit({ auth: process.env.GITHUB_TOKEN });
  },
  getGqlInstance: () => {
    return graphql.defaults({
      headers: {
        authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    });
  },
};

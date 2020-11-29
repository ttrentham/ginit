const { Octokit } = require("@octokit/rest");
const { graphql } = require("@octokit/graphql");

module.exports = {
  getInstance: () => {
    // add log:console for additional logging here
    return new Octokit({ auth: process.env.GITHUB_TOKEN });
  },
  getGqlInstance: async () => {
    const { repository } = await graphql(
      `
        {
          organization(login: "blacklocus") {
            repository(name: "flapjack") {
              milestone(number: 46) {
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
        }
      `,
      {
        headers: {
          authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
      }
    );
    return repository;
  },
};

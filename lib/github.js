import { Octokit } from "@octokit/rest";
import { graphql } from "@octokit/graphql";

export const getInstance = () => {
  // add log:console for additional logging here
  return new Octokit({ auth: process.env.GITHUB_TOKEN });
};

export const getGqlInstance = () => {
  return graphql.defaults({
    headers: {
      authorization: `token ${process.env.GITHUB_TOKEN}`,
    },
  });
};

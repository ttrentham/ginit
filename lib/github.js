const Octokit = require("@octokit/rest");

module.exports = {
  getInstance: () => {
    return Octokit({ log: console, auth: process.env.GITHUB_TOKEN });
  }
};

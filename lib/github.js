const Octokit = require("@octokit/rest");

module.exports = {
  getInstance: () => {
    // add log:console for additional logging here
    return Octokit({ auth: process.env.GITHUB_TOKEN });
  }
};

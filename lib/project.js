const CLI = require("clui");
const Spinner = CLI.Spinner;

const gh = require("./github");

module.exports = {
  getProjectsforOrg: async (organization) => {
    const github = gh.getInstance();

    const data = {
      org: organization,
    };

    const status = new Spinner("Getting " + organization + " projects...");
    status.start();

    try {
      const options = github.projects.listForOrg.endpoint.merge(data);
      const projects = await github.paginate(options);
      return projects;
    } catch (err) {
      throw err;
    } finally {
      status.stop();
    }
  },
};

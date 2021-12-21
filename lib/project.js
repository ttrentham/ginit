import CLI from "clui";
const Spinner = CLI.Spinner;

import { getInstance } from "./github.js";

export const getProjectsforOrg = async (organization) => {
  const github = getInstance();

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
};

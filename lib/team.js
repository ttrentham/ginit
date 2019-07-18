const CLI = require("clui");
const Spinner = CLI.Spinner;

const gh = require("./github");

function convertPermissions(permissions) {
  console.log(JSON.stringify(permissions));
  const { pull, push, admin } = permissions;
  if (admin) return "admin";
  else if (push) return "push";
  else if (pull) return "pull";
  return undefined;
}

module.exports = {
  copyTeamPermissions: async (org, source, destination) => {
    const github = gh.getInstance();
    const status = new Spinner("Copying team permissions...");
    status.start();

    try {
      // get the source team
      let team_slug = source;
      const sourceTeam = await github.teams.getByName({ org, team_slug });
      // note that the organization object comes with the team object
      let team_id = sourceTeam.data.id;
      console.log(
        "The source team %s's id is %d",
        sourceTeam.data.name,
        team_id
      );

      // get the destination team repositories
      const data = {
        team_id: team_id
      };

      const options = github.teams.listRepos.endpoint.merge(data);
      const repos = await github.paginate(options);

      // get the destination team
      team_slug = destination;
      const destTeam = await github.teams.getByName({ org, team_slug });
      team_id = destTeam.data.id;
      console.log(
        "The destination team %s's id is %d",
        destTeam.data.name,
        team_id
      );

      // add each repository to the target team
      for (let { name: repo, permissions } of repos) {
        let owner = org;
        console.log("Copying %s with permissions %s", repo, permissions);
        let permission = convertPermissions(permissions);
        const result = await github.teams.addOrUpdateRepo({
          team_id,
          owner,
          repo,
          permission
        });
      }
    } catch (err) {
      throw err;
    } finally {
      status.stop();
    }
  }
};

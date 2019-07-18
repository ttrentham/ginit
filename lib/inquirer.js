const inquirer = require("inquirer");
const files = require("./files");

module.exports = {
  askGithubOrg: () => {
    const questions = [
      {
        name: "organization",
        type: "input",
        message: "Enter your Github organization:",
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return "Please enter your Github organization.";
          }
        }
      },
      {
        name: "listRepos",
        type: "confirm",
        message: "Do you want to list repositories for this org?"
      },
      {
        name: "useteams",
        type: "confirm",
        message: "Do you want to copy repository permissions between two teams?"
      },
      {
        name: "source",
        type: "input",
        message:
          "Enter the team whose repository permissions you would like to copy from:",
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return "Please enter a source team";
          }
        },
        when: function(answers) {
          return answers.useteams;
        }
      },
      {
        name: "destination",
        type: "input",
        message:
          "Enter the team whose repository permissions you would like to copy to:",
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return "Please enter a destination team";
          }
        },
        when: function(answers) {
          return answers.useteams;
        }
      }
    ];
    return inquirer.prompt(questions);
  },

  askRepoDetails: () => {
    const argv = require("minimist")(process.argv.slice(2));

    const questions = [
      {
        type: "input",
        name: "name",
        message: "Enter a name for the repository:",
        default: argv._[0] || files.getCurrentDirectoryBase(),
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return "Please enter a name for the repository.";
          }
        }
      },
      {
        type: "input",
        name: "description",
        default: argv._[1] || null,
        message: "Optionally enter a description of the repository:"
      },
      {
        type: "list",
        name: "visibility",
        message: "Public or private:",
        choices: ["public", "private"],
        default: "public"
      }
    ];
    return inquirer.prompt(questions);
  },

  askIgnoreFiles: filelist => {
    const questions = [
      {
        type: "checkbox",
        name: "ignore",
        message: "Select the files and/or folders you wish to ignore:",
        choices: filelist,
        default: ["node_modules", "bower_components"]
      }
    ];
    return inquirer.prompt(questions);
  }
};

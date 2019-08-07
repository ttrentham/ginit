const team = require("./team");

const adminPermissions = { push: true, pull: true, admin: true };
it("returns permissions", () => {
  expect(team.convertPermissions(adminPermissions)).toEqual("admin");
});

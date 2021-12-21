//const team = require("./team");
import { convertPermissions } from "./team";

const adminPermissions = { push: true, pull: true, admin: true };
const writePermissions = { push: true, pull: true, admin: false };
const readPermissions = { push: false, pull: true, admin: false };

test("Admin permissions should return admin", () => {
  expect(convertPermissions(adminPermissions)).toEqual("admin");
});

test("Push permissions should return push", () => {
  expect(convertPermissions(writePermissions)).toEqual("push");
});

test("Pull permissions should return pull", () => {
  expect(convertPermissions(readPermissions)).toEqual("pull");
});

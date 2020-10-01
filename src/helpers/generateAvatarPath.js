const path = require("path");
const config = require("../../config");

module.exports = (avatarName) =>
  `http://localhost:${config.port}/images/${avatarName}`;

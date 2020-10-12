const path = require("path");
const config = require("../../config");

module.exports = (avatarName) =>
  `http://${config.host}:${config.port}/images/${avatarName}`;

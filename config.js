require("dotenv").config();

module.exports = {
  port: process.env.PORT,
  databaseUrl: process.env.MONGODB_URL,
  databaseName: process.env.MONGODB_NAME,
};

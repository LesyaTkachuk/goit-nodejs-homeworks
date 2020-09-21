require("dotenv").config();

module.exports = {
  port: process.env.PORT,
  databaseUrl: process.env.MONGODB_URL,
  databaseName: process.env.MONGODB_NAME,
  tokenSecretKey: process.env.TOKEN_SECRET_KEY,
  bcryptSaltRounds: 6,
};

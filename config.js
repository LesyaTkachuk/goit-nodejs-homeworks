require("dotenv").config();
const path = require("path");

module.exports = {
  port: process.env.PORT,
  host: "localhost",
  databaseUrl: process.env.MONGODB_URL,
  databaseName: process.env.MONGODB_NAME,
  tokenSecretKey: process.env.TOKEN_SECRET_KEY,
  bcryptSaltRounds: 6,
  defaultAvatar: "default_avatar.png",
  avatarDir: path.join(__dirname, "src", "public", "images"),
  temporaryDir: path.join(__dirname, "src", "tmp"),
  publicDir: path.join(__dirname, "src", "public"),
  nodemailer_user: process.env.NODEMAILER_USER,
  nodemailer_pass: process.env.NODEMAILER_PASSWORD,
};

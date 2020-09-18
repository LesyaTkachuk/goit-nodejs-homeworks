const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const connection = require("../db/Connection");
const contactRouter = require("../contacts/contactRouterMongoose");
const userRouter = require("../users/userRouter");
const config = require("../../config");
const errorHandler = require("../helpers/errorHandler");
const tokenCleaner = require("../corn/token-cleaner");

const app = express();

async function main() {
  try {
    await connection.connect();
    tokenCleaner();

    app.use(morgan("tiny"));
    app.use(cors());
    app.use(express.json());

    app.use("/contacts", contactRouter);
    app.use("/users", userRouter);

    app.use((err, req, res, next) => {
      if (err) {
        errorHandler(res, req, err);
        return;
      }
      next();
    });

    app.listen(config.port, () => {
      console.log("Start listening on port", config.port);
    });

    process.on("SIGILL", () => {
      connection.close();
    });
  } catch (e) {
    console.error(e);
  }
}

main();

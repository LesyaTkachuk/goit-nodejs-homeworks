const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const connection = require("../db/Connection");
const contactsRouter = require("../contacts/contactRouterMongoose");
const responseNormalizer = require("../normalizers/responseNormalizer");
const config = require("../config");

const app = express();

async function main() {
  try {
    await connection.connect();

    app.use(morgan("tiny"));
    app.use(cors());
    app.use(express.json());

    app.use("/contacts", contactsRouter);

    app.use((err, req, res, next) => {
      if (err) {
        return res.status(500).send(responseNormalizer(err));
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

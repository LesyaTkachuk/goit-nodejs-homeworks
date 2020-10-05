const app = require("./app");
const connection = require("../db/Connection");
const config = require("../../config");
const tokenCleaner = require("../corn/token-cleaner");

async function main() {
  try {
    await connection.connect();

    tokenCleaner();

    process.on("SIGILL", () => {
      connection.close();
    });

    app.listen(config.port, () => {
      console.log("Start listening on port", config.port);
    });
  } catch (e) {
    console.error(e);
  }
}

main();

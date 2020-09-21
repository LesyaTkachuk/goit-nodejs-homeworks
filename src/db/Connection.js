const config = require("../../config");
const mongoose = require("mongoose");

class Connection {
  async connect() {
    try {
      const connectionStatePromise = new Promise((resolve, reject) => {
        mongoose.connection.on("error", (err) => {
          console.error(error);
          process.exit(1);
        });

        mongoose.connection.on("open", () => {
          console.log("Database connection successful");
          resolve();
        });
      });

      await mongoose.connect(`${config.databaseUrl}${config.databaseName}`, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      });

      return connectionStatePromise;
    } catch (err) {
      console.log(err);
    }
  }

  async close() {
    await mongoose.connection.close();
  }
}

module.exports = new Connection();

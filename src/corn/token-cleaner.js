const UserModel = require("../users/UserModel");

const main = async () => {
  try {
    const users = await UserModel.find({
      "tokens.expires": { $lte: new Date().getTime() },
    });

    for (const user of users) {
      user.tokens = user.tokens.filter(
        (token) => new Date(token.expires).getTime() > new Date().getTime()
      );
    }

    await Promise.all(users.map((user) => user.save()));

    setTimeout(main, 24 * 60 * 60 * 1000);
  } catch (err) {
    console.err("Cron token cleaner error", err);
    setTimeout(main, 60 * 1000);
  }
};

module.exports = main;

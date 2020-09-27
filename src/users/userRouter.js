const { Router } = require("express");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const { promises: fsPromises } = require("fs");
const config = require("../../config");
const UserModel = require("./UserModel");
const { ApiError, errorHandler, validate, multer } = require("../helpers");
const responseNormalizer = require("../normalizers/responseNormalizer");
const { authorization, minifyAvatar } = require("../middlewares");

const router = Router();

router.get("/", async (req, res) => {
  try {
    validate(
      Joi.object({
        page: Joi.number().min(0),
        limit: Joi.number().min(1).max(100),
        sub: Joi.string(),
      }),
      req.body
    );
    const { page = 0, limit = 20, sub: subscription } = req.query;

    const users = await UserModel.find(
      subscription ? { subscription } : undefined
    )
      .skip(parseInt(page) * parseInt(limit))
      .limit(parseInt(limit));
    if (!users) {
      throw new ApiError(404, "Not found");
    }
    res.send(responseNormalizer({ users }));
  } catch (err) {
    errorHandler(req, res, err);
  }
});

router.post("/auth/register", async (req, res) => {
  try {
    validate(
      Joi.object({
        login: Joi.string().min(2).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(4).required(),
      }),
      req.body
    );

    const { login, email, password } = req.body;

    const [user] = await UserModel.find({
      $or: [{ email }, { login }],
    });

    if (user) throw new ApiError(409, "Login or Email are in use");

    const createdUser = await UserModel.create({
      login,
      email,
      password,
    });

    res.status(200).send(responseNormalizer(createdUser));
  } catch (err) {
    errorHandler(req, res, err);
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    validate(
      Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(4).required(),
      }),
      req.body
    );

    const { email, password } = req.body;

    const foundUser = await UserModel.findOne({ email });

    if (!foundUser) throw new ApiError(401, "Email or password is wrong");

    const isPasswordValid = await bcrypt.compare(password, foundUser.password);

    if (!isPasswordValid) throw new ApiError(401, "Email or password is wrong");

    const token = await foundUser.generateAndSaveToken();

    const { _id, email: userEmail, subscription } = foundUser;
    res.send(
      responseNormalizer({ _id, userEmail, subscription, activeToken: token })
    );
  } catch (err) {
    errorHandler(req, res, err);
  }
});

router.get("/current", authorization, async (req, res, next) => {
  try {
    const { _id, email, login, subscription } = req.user;

    res.send(responseNormalizer({ _id, email, login, subscription }));
  } catch (err) {
    errorHandler(req, res, err);
  }
});

router.post("/auth/logout", authorization, async (req, res) => {
  try {
    const { activeToken, user } = req;

    user.tokens = user.tokens.filter(
      (tokenRecord) => tokenRecord.token !== activeToken
    );

    await user.save();

    res.status(204).send();
  } catch (err) {
    errorHandler(req, res, err);
  }
});

router.delete("/:userId", async (req, res) => {
  try {
    const deletedUser = await UserModel.findByIdAndRemove(req.params.userId);
    if (!deletedUser) {
      throw new ApiError(404, "User was not found");
    }

    res.status(204).send();
  } catch (err) {
    errorHandler(req, res, err);
  }
});

router.patch("/", authorization, async (req, res) => {
  try {
    validate(
      Joi.object({
        login: Joi.string().min(2),
        subscription: Joi.string(),
      }),
      req.body
    );

    const { subscription, login } = req.body;
    const { _id } = req.user;

    if (login) {
      const user = await UserModel.findOne({ login });

      if (user)
        throw new ApiError(
          409,
          "Login is already in use. Please choose other one"
        );
    }

    const subscriptionArray = ["free", "pro", "premium"];

    if (subscription && !subscriptionArray.includes(subscription)) {
      throw new ApiError(400, "Please choose available type of subscription");
    }

    await UserModel.findByIdAndUpdate(
      _id,
      { $set: req.body },
      { returnNewDocument: true }
    );

    res.status(204).send();
  } catch (err) {
    errorHandler(req, res, err);
  }
});

router.post(
  "/avatar",
  authorization,
  multer.single("avatar"),
  minifyAvatar,
  async (req, res) => {
    try {
      const { avatarPath: previousAvatarPath } = req.user;

      const newAvatarURL = `http://localhost:${config.port}/images/${req.file.filename}`;

      req.user.avatarURL = newAvatarURL;
      req.user.avatarPath = req.file.path;

      await req.user.save();
      await fsPromises.unlink(previousAvatarPath);

      const { avatarURL } = req.user;

      res.status(200).send(responseNormalizer({ avatarURL }));
    } catch (err) {
      errorHandler(req, res, err);
    }
  }
);

module.exports = router;

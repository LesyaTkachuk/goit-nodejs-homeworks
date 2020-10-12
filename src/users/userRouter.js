const { Router } = require("express");
const Joi = require("joi");
const { promises: fsPromises } = require("fs");
const UserModel = require("./UserModel");
const {
  ApiError,
  errorHandler,
  validate,
  multer,
  generateAvatarPath,
} = require("../helpers");
const responseNormalizer = require("../normalizers/responseNormalizer");
const { authorization, minifyAvatar } = require("../middlewares");

const userRouter = Router();

userRouter.get("/", async (req, res) => {
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

userRouter.get("/current", authorization, async (req, res, next) => {
  try {
    const { _id, email, login, subscription } = req.user;

    res.send(responseNormalizer({ _id, email, login, subscription }));
  } catch (err) {
    errorHandler(req, res, err);
  }
});

userRouter.delete("/:userId", authorization, async (req, res) => {
  try {
    const deletedUser = await UserModel.findByIdAndRemove(req.params.userId);
    if (!deletedUser) {
      throw new ApiError(404, "User was not found");
    }

    await fsPromises.unlink(deletedUser.avatarPath);

    res.status(204).send();
  } catch (err) {
    errorHandler(req, res, err);
  }
});

userRouter.patch("/", authorization, async (req, res) => {
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

userRouter.post(
  "/avatar",
  authorization,
  multer.single("avatar"),
  minifyAvatar,
  async (req, res) => {
    try {
      const { avatarPath: previousAvatarPath } = req.user;

      req.user.avatarURL = generateAvatarPath(req.file.filename);
      req.user.avatarPath = req.file.path;

      await req.user.save();
      if (previousAvatarPath) await fsPromises.unlink(previousAvatarPath);

      const { avatarURL } = req.user;

      res.status(200).send(responseNormalizer({ avatarURL }));
    } catch (err) {
      errorHandler(req, res, err);
    }
  }
);

module.exports = userRouter;

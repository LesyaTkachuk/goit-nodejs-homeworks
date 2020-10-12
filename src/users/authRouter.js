const { Router } = require("express");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const UserModel = require("./UserModel");
const {
  ApiError,
  errorHandler,
  validate,
  createVerificationToken,
  nodemailer,
} = require("../helpers");
const responseNormalizer = require("../normalizers/responseNormalizer");
const { authorization } = require("../middlewares");

const authRouter = Router();

authRouter.post("/register", async (req, res) => {
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

    console.log(typeof createVerificationToken);

    const verificationToken = createVerificationToken();

    const createdUser = await UserModel.create({
      login,
      email,
      password,
      verificationToken,
    });

    await nodemailer.sendMail(email, verificationToken);

    res.status(201).send(responseNormalizer({ login, email }));
  } catch (err) {
    errorHandler(req, res, err);
  }
});

authRouter.post("/login", async (req, res) => {
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

    if (!foundUser || foundUser.verificationToken)
      throw new ApiError(401, "User is not authorized");

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

authRouter.post("/logout", authorization, async (req, res) => {
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

authRouter.get("/verify/:verificationToken", async (req, res, next) => {
  try {
    const { verificationToken } = req.params;

    const foundUser = await UserModel.findOne({ verificationToken });

    if (!foundUser) throw new ApiError(404, "User is not found");

    foundUser.verificationToken = null;

    await foundUser.save();

    res.status(200).send("User is successfully verified");
  } catch (err) {
    errorHandler(req, res, err);
  }
});

module.exports = authRouter;

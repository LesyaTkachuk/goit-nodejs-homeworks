const mongoose = require("mongoose");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const { promises: fsPromises } = require("fs");
const { generateAvatarPath } = require("../helpers");
const config = require("../../config");
const Avatar = require("avatar-builder");

const { Schema } = mongoose;

const UserSchema = new Schema({
  login: { type: String, required: true, unique: true },
  email: {
    type: String,
    validate: {
      validator(email) {
        const { error } = Joi.string().email().validate(email);
        if (error) throw new Error("Email is not valid");
      },
    },
    required: true,
  },
  password: { type: String, min: 4, required: true },
  avatarURL: {
    type: String,
    default: generateAvatarPath(config.defaultAvatar),
  },
  avatarPath: {
    type: String,
    default: path.join(config.avatarDir, config.defaultAvatar),
  },
  subscription: {
    type: String,
    enum: ["free", "pro", "premium"],
    default: "free",
  },
  tokens: [
    {
      token: { type: String, required: true },
      expires: { type: Date, required: true },
    },
  ],
  verificationToken: { type: String },
});

UserSchema.static(
  "hashPassword",
  async (password) => await bcrypt.hash(password, config.bcryptSaltRounds)
);

UserSchema.static("createAvatar", async () => {
  try {
    const avatar = Avatar.catBuilder(128);

    const buffer = await avatar.create();
    const avatarName = `avatar_default${Date.now()}.png`;
    const avatarPath = path.join(config.avatarDir, avatarName);

    await fsPromises.writeFile(avatarPath, buffer);

    const avatarURL = generateAvatarPath(avatarName);

    return { avatarURL, avatarPath };
  } catch (err) {
    console.err(err);
  }
});

UserSchema.method("isPasswordValid", async function (password) {
  return await bcrypt.compare(password, this.password);
});

UserSchema.method("generateAndSaveToken", async function () {
  const token = await jwt.sign({ id: this._id }, config.tokenSecretKey);

  this.tokens = [
    ...this.tokens,
    { token, expires: new Date().getTime() + 3 * 24 * 60 * 60 * 1000 },
  ];

  await this.save();

  return token;
});

UserSchema.pre("save", async function () {
  if (this.isNew) {
    this.password = await this.constructor.hashPassword(this.password);
  }
});

UserSchema.pre("save", async function () {
  if (this.isNew) {
    const { avatarURL, avatarPath } = await this.constructor.createAvatar();
    this.avatarURL = avatarURL;
    this.avatarPath = avatarPath;
  }
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;

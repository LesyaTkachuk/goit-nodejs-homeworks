const imagemin = require("imagemin");
const imageminJpegtran = require("imagemin-jpegtran");
const imageminPngquant = require("imagemin-pngquant");
const path = require("path");
const { promises: fsPromises } = require("fs");
const { errorHandler, ApiError } = require("../helpers");
const config = require("../../config");

module.exports = async function (req, res, next) {
  try {
    // const filePathForImageminAbsolute = `E:/NodeJS/goit-nodejs-homeworks/src/tmp/${req.file.filename}`;

    const filePathForImageminRelative = path.join(
      config.temporaryDir,
      req.file.filename
    );

    const [newAvatar] = await imagemin([filePathForImageminRelative], {
      destination: config.avatarDir,
      plugins: [
        imageminJpegtran(),
        imageminPngquant({
          quality: [0.6, 0.8],
        }),
      ],
    });
    await fsPromises.unlink(req.file.path);

    if (!newAvatar)
      throw new ApiError(400, "Problems with uploading an avatar");

    req.file = {
      ...req.file,
      path: path.join(config.avatarDir, req.file.filename),
      destination: config.avatarDir,
    };

    next();
  } catch (err) {
    errorHandler(req, res, err);
  }
};

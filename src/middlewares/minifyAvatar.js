const imagemin = require("imagemin");
const imageminJpegtran = require("imagemin-jpegtran");
const imageminPngquant = require("imagemin-pngquant");
const path = require("path");
const { promises: fsPromises } = require("fs");
const { errorHandler } = require("../helpers");
const config = require("../../config");

module.exports = async function (req, res, next) {
  try {
    const filePathForImagemin = `E:/NodeJS/goit-nodejs-homeworks/src/tmp/${req.file.filename}`;

    await imagemin([filePathForImagemin], {
      destination: config.avatarDir,
      plugins: [
        imageminJpegtran(),
        imageminPngquant({
          quality: [0.6, 0.8],
        }),
      ],
    });
    await fsPromises.unlink(req.file.path);

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

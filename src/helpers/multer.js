const multer = require("multer");
const path = require("path");
const config = require("../../config");

const storage = multer.diskStorage({
  destination: config.temporaryDir,
  filename: (req, file, cb) => {
    const { ext } = path.parse(file.originalname);
    const newFileName =
      req.user.login.toLowerCase() + "_avatar" + Date.now() + ext;
    cb(null, newFileName);
  },
});

module.exports = multer({ storage });

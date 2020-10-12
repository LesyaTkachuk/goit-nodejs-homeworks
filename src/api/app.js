const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const contactRouter = require("../contacts/contactRouterMongoose");
const userRouter = require("../users/userRouter");
const authRouter = require("../users/authRouter");
const config = require("../../config");
const errorHandler = require("../helpers/errorHandler");

const app = express();

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(config.publicDir));

app.use("/contacts", contactRouter);
app.use("/auth", authRouter);
app.use("/users", userRouter);

app.use((err, req, res, next) => {
  if (err) {
    errorHandler(req, res, err);
    return;
  }
  next();
});

module.exports = app;

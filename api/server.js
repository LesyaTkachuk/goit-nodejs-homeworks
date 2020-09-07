const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const contactsRouter = require("../contacts/contactsRouter");
const responseNormalizer = require("../normalizers/responseNormalizer");

const app = express();

const PORT = 3000;

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

app.use("/contacts", contactsRouter);

app.use((err, req, res, next) => {
  if (err) {
    return res.status(500).send(responseNormalizer(err));
  }
  next();
});

app.listen(PORT, () => {
  console.log("Start listening on port", PORT);
});

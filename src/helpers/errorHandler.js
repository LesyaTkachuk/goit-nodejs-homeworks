const ApiError = require("./ApiError");

module.exports = (req, res, error) => {
  console.error("---------------------");
  console.error(error);
  console.error("---------------------");
  console.error(req.params, req.query, req.body);
  console.error("=====================");

  if (error instanceof ApiError) {
    const { status, message, data } = error;
    return res.status(status).send({
      message,
      data,
    });
  }

  res.status(500).send({ message: "Internal server error" });
};

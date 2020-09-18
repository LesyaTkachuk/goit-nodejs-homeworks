const ApiError = require("./ApiError");

module.exports = (schema, data) => {
  const { error: validationError } = schema.validate(data);

  if (!validationError) return;

  throw new ApiError(400, "Bad request", validationError);
};

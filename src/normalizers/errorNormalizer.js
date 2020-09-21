const errorNormaliser = (message) => {
  return {
    success: false,
    message,
  };
};

module.exports = errorNormaliser;

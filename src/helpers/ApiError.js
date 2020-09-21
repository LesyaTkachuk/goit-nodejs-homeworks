module.exports = class ApiError extends Error {
  constructor(status, message, data = undefined) {
    super(message);
    this.status = status;
    this.data = data;
  }
};

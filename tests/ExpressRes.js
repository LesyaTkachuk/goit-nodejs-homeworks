class ExpressRes {
  constructor() {
    this.status = 200;
  }

  status(code) {
    this.status = code;
    return this;
  }

  send(data, status) {
    this.status = status;
  }
}

module.exports = ExpressRes;

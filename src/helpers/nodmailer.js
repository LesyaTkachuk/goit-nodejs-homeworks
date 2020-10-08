const nodemailer = require("nodemailer");
const config = require("../../config");

class Nodemailer {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.nodemailer_user,
        pass: config.nodemailer_pass,
      },
    });
  }

  async sendMail(userEmail, token) {
    await this.transporter.sendMail({
      from: config.nodemailer_user,
      to: userEmail,
      subject: "Verification Email",
      html: `<a href="http://${config.host}:${config.port}/auth/verify/${token}">Verify email</a>`,
    });
  }
}

module.exports = new Nodemailer();

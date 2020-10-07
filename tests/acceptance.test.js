const should = require("should");
const sinon = require("sinon");
const path = require("path");
const { promises: fsPromises } = require("fs");
const app = require("../src/api/app");
const UserModel = require("../src/users/UserModel");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const config = require("../config");

describe("Acceptance test", () => {
  describe("POST /users/avatar", () => {
    afterEach(() => sinon.restore());

    it("should return 401 token invalid", async () => {
      const { body } = await request(app)
        .post("/users/avatar")
        .set("Content-Type", "multipart/form-data")
        .set(
          "Authorization",
          "Bearer 134876597924697913049877331743663197491739"
        )
        .expect("Content-Type", /json/)
        .expect(401);

      console.log("body", body);
      body.should.have.property("message", "User is not authorized");
    });

    context("when everything ok", () => {
      it("should return 200", async () => {
        const token = await jwt.sign({ id: "123" }, config.tokenSecretKey);
        const tokens = [
          {
            token,
            expires: new Date().getTime() + 3 * 24 * 60 * 60 * 1000,
          },
        ];

        sinon.replace(
          UserModel,
          "findById",
          sinon.fake.returns({
            id: "123",
            login: "test",
            tokens,
            avatarURL: "",
            avatarPath: "",
            save: sinon.fake(),
          })
        );

        const response = await request(app)
          .post("/users/avatar")
          .set("Content-Type", "multipart/form-data")
          .set("Authorization", `Bearer ${token}`)
          .field("name", "my awesome avatar")
          .attach("avatar", path.join(__dirname, "fixtures", "some_avatar.png"))
          .expect("Content-Type", /json/)
          .expect(200)
          .catch((err) => console.log(err));

        response.body.data.should.have
          .property("avatarURL")
          .which.is.a.String();

        const { avatarURL } = response.body.data;
        const index = avatarURL.lastIndexOf("/");
        const filename = avatarURL.substring(index + 1);
        await fsPromises.unlink(path.join(config.avatarDir, filename));
      });
    });
  });
});

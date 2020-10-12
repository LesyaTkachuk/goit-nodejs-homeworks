const sinon = require("sinon");
const assert = require("assert");
const faker = require("faker");
const jwt = require("jsonwebtoken");
const config = require("../config");
const authorization = require("../src/middlewares/authorization");
const UserModel = require("../src/users/UserModel");
const ExpressRes = require("./ExpressRes");

const generateRes = () =>
  sinon.createStubInstance(ExpressRes, {
    status: sinon.stub().returnsThis(),
    send: sinon.fake(),
  });

class Req {
  constructor() {
    this.headers = {
      Authorization: `Bearer ${token}`,
    };
  }

  get() {}
}

const generateReq = (token) =>
  sinon.createStubInstance(Req, {
    get: sinon.stub().returns(`Bearer ${token}`),
  });

describe("Unit test of authorization middleware", () => {
  afterEach(() => sinon.restore());

  it("Missed token", async () => {
    const token = "";
    const next = sinon.fake();
    const res = generateRes();
    const req = generateReq(token);

    await authorization(req, res, next);

    assert.strictEqual(res.send.callCount, 1);
    assert.strictEqual(next.callCount, 0);
    assert.strictEqual(
      res.send.lastCall.firstArg.message,
      "User is not authorized"
    );
  });

  it("Token not valid", async function () {
    const token = await jwt.sign(faker.random.word(), config.tokenSecretKey);
    const next = sinon.fake();
    const res = generateRes();
    const req = generateReq(token);

    sinon.replace(UserModel, "findById", sinon.fake.returns(null));

    await authorization(req, res, next);

    assert.strictEqual(next.callCount, 0);
    assert.strictEqual(res.send.callCount, 1);
    assert.strictEqual(
      res.send.lastCall.firstArg.message,
      "User is not authorized"
    );
  });

  it("Token is valid", async () => {
    const token = jwt.sign(faker.random.word(), config.tokenSecretKey);
    const tokens = [
      { token, expires: new Date().getTime() + 3 * 24 * 60 * 60 * 1000 },
    ];
    const next = sinon.fake();
    const res = generateRes();
    const req = generateReq(token);

    sinon.replace(
      UserModel,
      "findById",
      sinon.fake.returns({ _id: 1, tokens })
    );

    await authorization(generateReq(token), res, next);

    assert.strictEqual(res.send.callCount, 0);
    assert.strictEqual(next.callCount, 1);
  });
});

const jwt = require("jsonwebtoken");

const { SECRET } = require("../config");

module.exports = function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    SECRET,
    { expiresIn: "1h" }
  );
};

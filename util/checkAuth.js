const jwt = require("jsonwebtoken");
const { AuthenticationError } = require("apollo-server");

const { SECRET } = require("../config");

module.exports = function checkAuth(context) {
  const authHeader = context.req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split("Bearer ")[1];

    if (!token) {
      throw new AuthenticationError("Auth token must 'Bearer [token]'");
    }

    try {
      const user = jwt.verify(token, SECRET);
      return user;
    } catch (err) {
      throw new AuthenticationError("Invalid or expired token");
    }
  }

  throw new AuthenticationError("Authorization header must provided");
};

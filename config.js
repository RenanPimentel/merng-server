const dotenv = require("dotenv");
dotenv.config();

const { MONGODB, SECRET, PORT } = process.env;

module.exports = { MONGODB, SECRET, PORT };

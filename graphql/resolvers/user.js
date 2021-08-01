const bcrypt = require("bcryptjs");
const { UserInputError } = require("apollo-server");

const User = require("../../models/User");
const createToken = require("../../util/createToken");
const validators = require("../../util/validators");

const { validateRegisterInput, validateLoginInput } = validators;

module.exports = {
  Mutation: {
    async login(parent, { username, password }, context, info) {
      const { errors, valid } = validateLoginInput(username, password);

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      const user = await User.findOne({ username });

      if (!user) {
        errors.general = "User not found";
        throw new UserInputError("User not found", { errors });
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        errors.general = "Wrong password";
        throw new UserInputError("Wrong password", { errors });
      }

      const token = createToken(user);

      return { ...user._doc, id: user._id, token };
    },

    async register(parent, args, context, info) {
      const { username, email, password, confirmPassword } = args.registerInput;

      // Validate user data
      const user = await User.findOne({ username });
      const { errors, valid } = validateRegisterInput(args.registerInput);

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      // Make sure user doesnt already exist
      if (user) {
        throw new UserInputError(`User ${username} already exists`, {
          errors: {
            username: "Username already taken",
          },
        });
      }

      // Hash the password and create an auth token
      if (password !== confirmPassword) {
        throw new UserInputError("Passwords must match", {
          errors: {
            confirmPassword: "Passwords dont match",
          },
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = new User({
        email,
        username,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
      });

      const res = await newUser.save();
      const token = createToken(res);

      return { ...res._doc, id: res._id, token };
    },
  },
};

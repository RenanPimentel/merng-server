const isEmail = require("./isEmail");

module.exports = {
  validateRegisterInput({ username, email, password, confirmPassword }) {
    const errors = {};

    if (username.trim() === "") {
      errors.username = "Username can not be empty";
    }

    if (email.trim() === "") {
      errors.email = "Email can not be empty";
    } else if (!isEmail(email)) {
      errors.email = "Email not valid";
    }

    if (password === "") {
      errors.password = "Password can not be empty";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords must match";
    }

    return { errors, valid: Object.keys(errors).length === 0 };
  },

  validateLoginInput(username, password) {
    const errors = {};

    if (username.trim() === "") {
      errors.username = "Username can not be empty";
    }

    if (password === "") {
      errors.password = "Password can not be empty";
    }

    return { errors, valid: Object.keys(errors).length === 0 };
  },
};

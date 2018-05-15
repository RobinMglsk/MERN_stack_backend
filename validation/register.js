const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateRegisterInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : "";
  if (
    !Validator.isLength(data.name, {
      min: 2,
      max: 30
    })
  ) {
    errors.name = "Name must be between 2 and 30 characters";
  }
  if (Validator.isEmpty(data.name)) {
    errors.name = "Name field is required";
  }

  data.email = !isEmpty(data.email) ? data.email : "";
  if (!Validator.isEmail(data.email)) {
    errors.email = "Email must be a valid e-mailaddress";
  }
  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
  }

  data.password = !isEmpty(data.password) ? data.password : "";
  if (
    !Validator.isLength(data.password, {
      min: 8,
      max: 64
    })
  ) {
    errors.password = "Password must be between 8 and 64 characters";
  }
  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  }

  data.password2 = !isEmpty(data.password2) ? data.password2 : "";
  if (!Validator.equals(data.password, data.password2)) {
    errors.password2 = "Passwords must match";
  }
  if (Validator.isEmpty(data.password2)) {
    errors.password2 = "Password confirm field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

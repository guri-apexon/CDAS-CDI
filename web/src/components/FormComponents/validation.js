import { getPasswordStrength } from "apollo-react/components/PasswordComplexity/PasswordComplexity";

const checkRequired = (value) => {
  if (!value || (typeof value === "string" && !value.trim())) {
    return "Required";
  }
  return false;
};

const checkPasswordStrength = (password) => {
  const strength = getPasswordStrength(password);
  if (["short", "weak"].includes(strength)) {
    return `Password is ${strength}`;
  }
  return false;
};

const checkPasswordMatch = (password, passwordConfirm) => {
  if (password !== passwordConfirm) {
    return "Passwords do not match";
  }
  return false;
};

const removeUndefined = (arr) =>
  Object.keys(arr)
    .filter((key) => arr[key] !== undefined)
    .reduce((res, key) => {
      res[key] = arr[key];
      return res;
    }, {});

const validate = ({
  firstName,
  lastName,
  email,
  agree,
  password,
  passwordConfirm,
}) =>
  removeUndefined({
    firstName: checkRequired(firstName),
    lastName: checkRequired(lastName),
    email: checkRequired(email),
    password: checkRequired(password) || checkPasswordStrength(password),
    passwordConfirm:
      checkRequired(passwordConfirm) ||
      checkPasswordMatch(password, passwordConfirm),
    agree: checkRequired(agree),
  });

export default validate;

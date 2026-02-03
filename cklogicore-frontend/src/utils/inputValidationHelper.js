export const inputValidationHelper = (name, value, validationType) => {
  if (!value && value !== 0) return "";

  switch (validationType) {
    case "name":
      // At least 2 letters before any numbers
      if (!/^[a-zA-Z]{2,}/.test(value)) {
        return "Must start with at least 2 letters";
      }
      break;

    case "mobile":
      if (!/^\d{10}$/.test(value)) {
        return "Must be exactly 10 digits";
      }
      break;

    case "email":
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "Invalid email format";
      }
      break;

    case "positiveNumber":
      if (parseFloat(value) < 0) {
        return "Negative values not allowed";
      }
      break;

    default:
      return "";
  }
  return "";
};
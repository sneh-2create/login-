// Utility helpers for input sanitization and validation
export function sanitizePhone(value = "") {
  return String(value).replace(/\D/g, "").slice(0, 10);
}

export function phoneErrorMessage(value = "") {
  const digits = sanitizePhone(value);
  if (!digits) return "";
  if (digits.length < 10) return "Please enter 10 digit phone number";
  return "";
}

// Remove forbidden characters from password input
export function sanitizePassword(raw = "") {
  return String(raw).replace(/[()\[\]{}<>\s+\-=]/g, "");
}

export function passwordErrorMessage(password = "", attemptedInvalid = false) {
  if (!password && !attemptedInvalid) return "";
  if (attemptedInvalid) return "Spaces, brackets, '+', '-' and '=' are not allowed";
  if (String(password).trim().length < 3) return "Password must be at least 3 characters";
  return "";
}

export function isPhoneValid(value = "") {
  return sanitizePhone(value).length === 10;
}

export function isPasswordValid(password = "") {
  return String(password).trim().length >= 3;
}

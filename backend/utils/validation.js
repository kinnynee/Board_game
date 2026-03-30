function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validateRegisterPayload(payload = {}) {
  const username = normalizeText(payload.username);
  const email = normalizeText(payload.email);
  const password = normalizeText(payload.password);

  if (!username) {
    return {
      isValid: false,
      message: "Username is required.",
    };
  }

  if (!password || password.length < 6) {
    return {
      isValid: false,
      message: "Password must be at least 6 characters.",
    };
  }

  return {
    isValid: true,
    value: {
      username,
      email,
      password,
    },
  };
}

function validateLoginPayload(payload = {}) {
  const username = normalizeText(payload.username);
  const password = normalizeText(payload.password);

  if (!username || !password) {
    return {
      isValid: false,
      message: "Username and password are required.",
    };
  }

  return {
    isValid: true,
    value: {
      username,
      password,
    },
  };
}

function validateProfilePayload(payload = {}) {
  return {
    isValid: true,
    value: {
      display_name: normalizeText(payload.display_name),
      bio: normalizeText(payload.bio),
    },
  };
}

module.exports = {
  normalizeText,
  validateLoginPayload,
  validateProfilePayload,
  validateRegisterPayload,
};

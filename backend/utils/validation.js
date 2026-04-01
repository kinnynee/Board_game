function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeRegisterBody(body = {}) {
  return {
    username: String(body.username || '').trim(),
    email: String(body.email || '').trim().toLowerCase(),
    password: String(body.password || ''),
    display_name: String(body.display_name || '').trim(),
  };
}

function validateRegisterInput(input) {
  const errors = [];

  if (!input.username) {
    errors.push('Username is required.');
  } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(input.username)) {
    errors.push('Username must be 3-20 characters and only include letters, numbers, or underscore.');
  }

  if (!input.email) {
    errors.push('Email is required.');
  } else if (!isEmail(input.email)) {
    errors.push('Email is not valid.');
  }

  if (!input.password) {
    errors.push('Password is required.');
  } else if (input.password.length < 6) {
    errors.push('Password must be at least 6 characters.');
  }

  if (input.display_name && input.display_name.length > 120) {
    errors.push('Display name must be 120 characters or fewer.');
  }

  return errors;
}

function normalizeProfileBody(body = {}) {
  return {
    display_name: String(body.display_name || '').trim(),
    email: String(body.email || '').trim().toLowerCase(),
    bio: String(body.bio || '').trim(),
  };
}

function validateProfileInput(input) {
  const errors = [];

  if (!input.display_name) {
    errors.push('Display name is required.');
  } else if (input.display_name.length > 120) {
    errors.push('Display name must be 120 characters or fewer.');
  }

  if (!input.email) {
    errors.push('Email is required.');
  } else if (!isEmail(input.email)) {
    errors.push('Email is not valid.');
  }

  if (input.bio.length > 300) {
    errors.push('Bio must be 300 characters or fewer.');
  }

  return errors;
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

module.exports = {
  isEmail,
  normalizeRegisterBody,
  validateRegisterInput,
  normalizeProfileBody,
  validateProfileInput,
  parsePositiveInt,
};

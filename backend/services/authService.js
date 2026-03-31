const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { JWT_SECRET } = require('../middleware/auth');
const { serializeUser } = require('../utils/serializers');
const createHttpError = require('../utils/httpError');
const {
  normalizeRegisterBody,
  validateRegisterInput,
} = require('../utils/validation');
const userService = require('./userService');

function createToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

function buildAuthPayload(user) {
  return {
    token: createToken(user.id),
    user: serializeUser(user, { includeEmail: true, includeStatus: true }),
  };
}

async function registerUser(body) {
  const input = normalizeRegisterBody(body);
  const errors = validateRegisterInput(input);

  if (errors.length) {
    throw createHttpError(400, errors[0], { errors });
  }

  const existingUser = await userService.findExistingRegisterUser(input.username, input.email);

  if (existingUser) {
    throw createHttpError(409, 'Username or email already exists.');
  }

  const password_hash = await bcrypt.hash(input.password, 10);
  const display_name = input.display_name || input.username;

  const user = await userService.createUser({
    username: input.username,
    email: input.email,
    password_hash,
    display_name,
    is_active: true,
  });

  return buildAuthPayload(user);
}

async function loginUser(body) {
  const identifier = String(body?.username || body?.email || '').trim().toLowerCase();
  const password = String(body?.password || '');

  if (!identifier || !password) {
    throw createHttpError(400, 'Username/email and password are required.');
  }

  const user = await userService.findUserByIdentifier(identifier);

  if (!user) {
    throw createHttpError(401, 'Incorrect username/email or password.');
  }

  if (!user.is_active) {
    throw createHttpError(403, 'This account has been disabled.');
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    throw createHttpError(401, 'Incorrect username/email or password.');
  }

  return buildAuthPayload(user);
}

function getCurrentUser(user) {
  return serializeUser(user, { includeEmail: true, includeStatus: true });
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};

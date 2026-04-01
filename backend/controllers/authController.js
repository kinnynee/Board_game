const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('../db');
const { JWT_SECRET } = require('../middleware/auth');
const { serializeUser } = require('../utils/serializers');
const {
  normalizeRegisterBody,
  validateRegisterInput,
} = require('../utils/validation');

function createToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

async function register(req, res) {
  const input = normalizeRegisterBody(req.body);
  const errors = validateRegisterInput(input);

  if (errors.length) {
    return res.status(400).json({ message: errors[0], errors });
  }

  const existingUser = await db('users')
    .whereRaw('LOWER(username) = ?', [input.username.toLowerCase()])
    .orWhereRaw('LOWER(email) = ?', [input.email])
    .first();

  if (existingUser) {
    return res.status(409).json({ message: 'Username or email already exists.' });
  }

  const password_hash = await bcrypt.hash(input.password, 10);
  const display_name = input.display_name || input.username;

  const [user] = await db('users')
    .insert({
      username: input.username,
      email: input.email,
      password_hash,
      display_name,
      is_active: true,
    })
    .returning([
      'id',
      'username',
      'email',
      'display_name',
      'bio',
      'role',
      'is_active',
      'created_at',
      'updated_at',
    ]);

  return res.status(201).json({
    token: createToken(user.id),
    user: serializeUser(user, { includeEmail: true, includeStatus: true }),
  });
}

async function login(req, res) {
  const identifier = String(req.body?.username || req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Username/email and password are required.' });
  }

  const user = await db('users')
    .whereRaw('LOWER(username) = ?', [identifier])
    .orWhereRaw('LOWER(email) = ?', [identifier])
    .first();

  if (!user) {
    return res.status(401).json({ message: 'Incorrect username/email or password.' });
  }

  if (!user.is_active) {
    return res.status(403).json({ message: 'This account has been disabled.' });
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    return res.status(401).json({ message: 'Incorrect username/email or password.' });
  }

  return res.json({
    token: createToken(user.id),
    user: serializeUser(user, { includeEmail: true, includeStatus: true }),
  });
}

async function getMe(req, res) {
  return res.json(serializeUser(req.user, { includeEmail: true, includeStatus: true }));
}

module.exports = {
  register,
  login,
  getMe,
};

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('./db');
const { requireAuth, JWT_SECRET } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

app.use(cors());
app.use(express.json());

function createToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

function serializeUser(user, options = {}) {
  const payload = {
    id: user.id,
    username: user.username,
    display_name: user.display_name,
    bio: user.bio || '',
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };

  if (options.includeEmail) {
    payload.email = user.email;
  }

  return payload;
}

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

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/auth/register', asyncHandler(async (req, res) => {
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

  const ids = await db('users').insert({
    username: input.username,
    email: input.email,
    password_hash,
    display_name,
  });

  const user = await db('users').where({ id: ids[0] }).first();

  return res.status(201).json({
    token: createToken(user.id),
    user: serializeUser(user, { includeEmail: true }),
  });
}));

app.post('/api/auth/login', asyncHandler(async (req, res) => {
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

  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    return res.status(401).json({ message: 'Incorrect username/email or password.' });
  }

  return res.json({
    token: createToken(user.id),
    user: serializeUser(user, { includeEmail: true }),
  });
}));

app.get('/api/auth/me', requireAuth, asyncHandler(async (req, res) => {
  res.json(serializeUser(req.user, { includeEmail: true }));
}));

app.get('/api/users/:id', requireAuth, asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: 'User id is not valid.' });
  }

  const user = await db('users').where({ id }).first();

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const includeEmail = req.user.id === user.id;

  return res.json(serializeUser(user, { includeEmail }));
}));

app.put('/api/users/me', requireAuth, asyncHandler(async (req, res) => {
  const input = normalizeProfileBody(req.body);
  const errors = validateProfileInput(input);

  if (errors.length) {
    return res.status(400).json({ message: errors[0], errors });
  }

  const emailOwner = await db('users')
    .whereRaw('LOWER(email) = ?', [input.email])
    .andWhereNot({ id: req.user.id })
    .first();

  if (emailOwner) {
    return res.status(409).json({ message: 'Email is already being used by another account.' });
  }

  await db('users')
    .where({ id: req.user.id })
    .update({
      display_name: input.display_name,
      email: input.email,
      bio: input.bio,
      updated_at: db.fn.now(),
    });

  const updatedUser = await db('users').where({ id: req.user.id }).first();

  return res.json(serializeUser(updatedUser, { includeEmail: true }));
}));

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

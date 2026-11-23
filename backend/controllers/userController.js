const { randomBytes, scrypt } = require('node:crypto');
const { promisify } = require('node:util');
const User = require('../models/User');

const deriveKey = promisify(scrypt);

async function register(req, res, onRegistered) {
  const { username, email, password } = req.body ?? {};

  if (typeof username !== 'string' || typeof email !== 'string' ||
      typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return res.status(400).json({ message: 'Provide a username, email, and password of 8–128 characters' });
  }

  const salt = randomBytes(16).toString('hex');
  const key = await deriveKey(password, salt, 64);
  const user = await User.create({ username, email, passwordHash: `${salt}:${key.toString('hex')}` });

  if (onRegistered) return onRegistered(req, res, user, 201);
  res.status(201).json({ user });
}

async function getProfile(req, res) {
  const username = req.params.username.toLowerCase();
  const user = await User.findOne({ username }).select('username fullName bio avatarUrl -_id');

  if (!user) return res.status(404).json({ message: 'User not found' });

  res.json({ user });
}

module.exports = { register: (req, res) => register(req, res), registerWithSession: register, getProfile, deriveKey };

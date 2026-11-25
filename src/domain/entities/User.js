'use strict';
const { ValidationError } = require('../errors');
const { newId, now } = require('../util');

const normalizeUsername = (u) => String(u || '').trim().toLowerCase();

function validateCredentials(username, password) {
  if (!/^[a-z0-9._-]{3,32}$/.test(normalizeUsername(username))) {
    throw new ValidationError('Username must be 3–32 characters: letters, numbers, dot, dash or underscore');
  }
  if (String(password || '').length < 8) throw new ValidationError('Password must be at least 8 characters');
}

/** passwordHash is produced by the PasswordHasher port. `tokenVersion` invalidates sessions when bumped. */
function createUser(username, passwordHash) {
  return { id: newId('u_'), username: normalizeUsername(username), passwordHash, tokenVersion: 1, createdAt: now() };
}

const publicUser = (u) => ({ id: u.id, username: u.username, createdAt: u.createdAt });

module.exports = { normalizeUsername, validateCredentials, createUser, publicUser };

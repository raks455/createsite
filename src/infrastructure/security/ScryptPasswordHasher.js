'use strict';
const crypto = require('crypto');
const { promisify } = require('util');
const scrypt = promisify(crypto.scrypt);

class ScryptPasswordHasher {
  async hash(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const key = await scrypt(String(password), salt, 64);
    return `scrypt$${salt}$${key.toString('hex')}`;
  }

  async verify(password, stored) {
    const [algo, salt, hash] = String(stored || '').split('$');
    if (algo !== 'scrypt' || !salt || !hash) return false;
    const key = await scrypt(String(password), salt, 64);
    const expected = Buffer.from(hash, 'hex');
    return key.length === expected.length && crypto.timingSafeEqual(key, expected);
  }
}

module.exports = ScryptPasswordHasher;

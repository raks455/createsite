'use strict';
// Stateless signed tokens: base64url(JSON payload).HMAC-SHA256
const crypto = require('crypto');

class HmacTokenService {
  constructor(secret) {
    if (!secret) throw new Error('HmacTokenService needs a secret');
    this.secret = secret;
  }

  #sig(body) {
    return crypto.createHmac('sha256', this.secret).update(body).digest('base64url');
  }

  sign(payload, ttlSeconds) {
    const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + ttlSeconds * 1000 })).toString('base64url');
    return `${body}.${this.#sig(body)}`;
  }

  verify(token) {
    const [body, sig] = String(token || '').split('.');
    if (!body || !sig) return null;
    const expected = this.#sig(body);
    if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    try {
      const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
      return payload.exp > Date.now() ? payload : null;
    } catch {
      return null;
    }
  }
}

module.exports = HmacTokenService;

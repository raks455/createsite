'use strict';
const { AppError } = require('../../../domain/errors');

/** Wraps async route handlers so rejections reach the error middleware. */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function parseCookies(header) {
  const out = {};
  String(header || '').split(';').forEach((part) => {
    const i = part.indexOf('=');
    if (i > 0) {
      try { out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim()); } catch {}
    }
  });
  return out;
}

/** Cookie-based session handling on top of AuthService. */
function createAuthMiddleware(authService, { cookieName, sessionTtlSeconds }) {
  return {
    attachUser: asyncHandler(async (req, res, next) => {
      req.user = await authService.authenticate(parseCookies(req.headers.cookie)[cookieName]);
      next();
    }),
    requireAuth(req, res, next) {
      if (!req.user) return res.status(401).json({ error: 'Not signed in' });
      next();
    },
    setSession(req, res, token) {
      res.setHeader('Set-Cookie', `${cookieName}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${sessionTtlSeconds}${req.secure ? '; Secure' : ''}`);
    },
    clearSession(res) {
      res.setHeader('Set-Cookie', `${cookieName}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
    },
  };
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err instanceof AppError ? err.status : err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);
  const message = status >= 500 && !(err instanceof AppError) ? 'Something went wrong' : err.message;
  if (res.headersSent) return res.end();
  if (req.path.startsWith('/api/') || req.accepts(['json', 'html']) === 'json') return res.status(status).json({ error: message, code: err.code });
  res.status(status).type('text').send(message);
}

module.exports = { asyncHandler, createAuthMiddleware, errorHandler };

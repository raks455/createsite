'use strict';
const path = require('path');

const ROOT = path.join(__dirname, '..');
const env = process.env;

module.exports = {
  port: Number(env.PORT) || 3000,
  dataFile: path.resolve(env.DATA_DIR || path.join(ROOT, 'data'), 'db.json'),
  uploadsDir: path.resolve(env.UPLOADS_DIR || path.join(ROOT, 'uploads')),
  uploadsPublicPath: '/uploads',
  sitePathPrefix: '/s',
  cookieName: 'sf_session',
  sessionTtlSeconds: 7 * 24 * 3600,
  maxUploadBytes: (Number(env.MAX_UPLOAD_MB) || 50) * 1024 * 1024,
  initialAdmin: {
    username: env.ADMIN_USER || 'admin',
    password: env.ADMIN_PASSWORD || 'admin123',
  },
};

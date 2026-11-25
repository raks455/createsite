'use strict';
const path = require('path');

const ROOT = path.join(__dirname, '..');
const env = process.env;

module.exports = {
  appName: 'CreateSite',
  port: Number(env.PORT) || 3000,
  /** PostgreSQL connection string (e.g. Neon). When empty, data is kept in JSON files under DATA_DIR. */
  databaseUrl: env.DATABASE_URL || '',
  /** Signs session cookies. Generated and stored in the database/data file when not set. */
  sessionSecret: env.SESSION_SECRET || '',
  dataFile: path.resolve(env.DATA_DIR || path.join(ROOT, 'data'), 'db.json'),
  uploadsDir: path.resolve(env.UPLOADS_DIR || path.join(ROOT, 'uploads')),
  uploadsPublicPath: '/uploads',
  sitePathPrefix: '/s',
  cookieName: 'cs_session',
  sessionTtlSeconds: 7 * 24 * 3600,
  maxUploadBytes: (Number(env.MAX_UPLOAD_MB) || 50) * 1024 * 1024,
  initialAdmin: {
    username: env.ADMIN_USER || 'admin',
    password: env.ADMIN_PASSWORD || 'admin123',
  },
  /** Source of the standalone TypeScript project each site exports to. */
  siteTemplateDir: path.join(ROOT, 'site-template'),
  coreSrcDir: path.join(ROOT, 'core', 'src'),
};

'use strict';
const path = require('path');
const express = require('express');
const { createAuthMiddleware, errorHandler } = require('./middleware');

const ADMIN_DIR = path.join(__dirname, '..', '..', '..', 'admin');

/** Builds the Express app from the dependency container. */
function createApp(container) {
  const { config, authService } = container;
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', true);

  const auth = createAuthMiddleware(authService, config);

  // Site packages embed media, so they can be large
  app.use('/api/sites/import', express.json({ limit: '500mb' }));
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use(auth.attachUser);

  // Admin API
  const api = express.Router();
  api.use(require('./routes/authRoutes')(container, auth));
  api.use(auth.requireAuth);
  api.use(require('./routes/schemaRoutes')(container));
  api.use(require('./routes/siteRoutes')(container));
  api.use(require('./routes/mediaRoutes')(container));
  api.use(require('./routes/submissionRoutes')(container));
  api.use((req, res) => res.status(404).json({ error: 'Not found' }));
  app.use('/api', api);

  // Admin panel (static single-page app) and uploaded media
  app.use('/admin', express.static(ADMIN_DIR, { index: 'index.html' }));
  app.use(config.uploadsPublicPath, express.static(config.uploadsDir, { maxAge: '7d', fallthrough: false }));

  // Public websites
  const pub = require('./routes/publicRoutes')(container);
  app.use(pub.domainRouter);
  app.use(pub.slugRouter);

  app.get('/', (req, res) => res.redirect('/admin/'));
  app.use((req, res) => res.status(404).type('text').send('Not found'));
  app.use(errorHandler);
  return app;
}

module.exports = createApp;

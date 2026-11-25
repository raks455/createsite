'use strict';
// Composition root: the only place that knows which adapter implements which
// port. Swap an adapter here (e.g. a Postgres SiteRepository or S3 storage)
// and nothing else in the app needs to change.
const config = require('./config');

// Infrastructure
const JsonFileStore = require('./infrastructure/persistence/JsonFileStore');
const { JsonSiteRepository, JsonUserRepository, JsonSubmissionRepository } = require('./infrastructure/persistence/JsonRepositories');
const LocalMediaStorage = require('./infrastructure/storage/LocalMediaStorage');
const ScryptPasswordHasher = require('./infrastructure/security/ScryptPasswordHasher');
const HmacTokenService = require('./infrastructure/security/HmacTokenService');
const ZipArchiveWriter = require('./infrastructure/archive/ZipArchiveWriter');

// Application
const templates = require('./application/templates');
const SiteService = require('./application/services/SiteService');
const PageService = require('./application/services/PageService');
const AuthService = require('./application/services/AuthService');
const MediaService = require('./application/services/MediaService');
const SubmissionService = require('./application/services/SubmissionService');
const PublishingService = require('./application/services/PublishingService');

// Presentation
const siteRenderer = require('./presentation/site/SiteRenderer');
const createApp = require('./presentation/http/createApp');

function buildContainer() {
  const store = new JsonFileStore(config.dataFile).load();
  const siteRepo = new JsonSiteRepository(store);
  const userRepo = new JsonUserRepository(store);
  const submissionRepo = new JsonSubmissionRepository(store);
  const mediaStorage = new LocalMediaStorage({ root: config.uploadsDir, publicBase: config.uploadsPublicPath });

  return {
    config,
    authService: new AuthService({
      userRepo,
      passwordHasher: new ScryptPasswordHasher(),
      tokenService: new HmacTokenService(store.meta.secret),
      sessionTtlSeconds: config.sessionTtlSeconds,
    }),
    siteService: new SiteService({ siteRepo, submissionRepo, mediaStorage, templates }),
    pageService: new PageService({ siteRepo }),
    mediaService: new MediaService({ siteRepo, mediaStorage }),
    submissionService: new SubmissionService({ siteRepo, submissionRepo }),
    publishingService: new PublishingService({
      siteRepo, mediaStorage, renderer: siteRenderer, archiveWriter: new ZipArchiveWriter(), sitePathPrefix: config.sitePathPrefix,
    }),
  };
}

async function start() {
  const container = buildContainer();
  const admin = await container.authService.ensureInitialAdmin(config.initialAdmin.username, config.initialAdmin.password);
  if (admin) {
    console.log(`\n  Created admin user → username: ${config.initialAdmin.username}  password: ${config.initialAdmin.password}`);
    console.log('  Change the password under Account in the admin panel.');
  }
  const app = createApp(container);
  app.listen(config.port, () => {
    console.log(`\n  SiteForge is running`);
    console.log(`  Admin panel → http://localhost:${config.port}/admin\n`);
  });
}

module.exports = { buildContainer, start };

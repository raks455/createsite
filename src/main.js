'use strict';
// Composition root: the only place that knows which adapter implements which
// port. With DATABASE_URL set (e.g. Neon) everything — sites, users, form
// entries and media — lives in PostgreSQL; otherwise in local JSON files.
const config = require('./config');

// Infrastructure
const JsonFileStore = require('./infrastructure/persistence/JsonFileStore');
const { JsonSiteRepository, JsonUserRepository, JsonSubmissionRepository } = require('./infrastructure/persistence/JsonRepositories');
const PgDatabase = require('./infrastructure/persistence/postgres/PgDatabase');
const { PgSiteRepository, PgUserRepository, PgSubmissionRepository } = require('./infrastructure/persistence/postgres/PgRepositories');
const LocalMediaStorage = require('./infrastructure/storage/LocalMediaStorage');
const PgMediaStorage = require('./infrastructure/storage/PgMediaStorage');
const ScryptPasswordHasher = require('./infrastructure/security/ScryptPasswordHasher');
const HmacTokenService = require('./infrastructure/security/HmacTokenService');
const ZipArchiveWriter = require('./infrastructure/archive/ZipArchiveWriter');
const SiteSourceTemplate = require('./infrastructure/export/SiteSourceTemplate');

// Application
const templates = require('./application/templates');
const SiteService = require('./application/services/SiteService');
const PageService = require('./application/services/PageService');
const AuthService = require('./application/services/AuthService');
const MediaService = require('./application/services/MediaService');
const SubmissionService = require('./application/services/SubmissionService');
const PublishingService = require('./application/services/PublishingService');
const SourceExportService = require('./application/services/SourceExportService');
const DeploymentService = require('./application/services/DeploymentService');

// Presentation
const siteRenderer = require('./presentation/site/SiteRenderer');
const createApp = require('./presentation/http/createApp');

async function buildStorage() {
  if (config.databaseUrl) {
    const db = await new PgDatabase(config.databaseUrl).migrate();
    return {
      kind: 'PostgreSQL',
      siteRepo: new PgSiteRepository(db),
      userRepo: new PgUserRepository(db),
      submissionRepo: new PgSubmissionRepository(db),
      mediaStorage: new PgMediaStorage(db, { publicBase: config.uploadsPublicPath }),
      secret: config.sessionSecret || (await db.secret()),
    };
  }
  const store = new JsonFileStore(config.dataFile).load();
  return {
    kind: `JSON file (${config.dataFile})`,
    siteRepo: new JsonSiteRepository(store),
    userRepo: new JsonUserRepository(store),
    submissionRepo: new JsonSubmissionRepository(store),
    mediaStorage: new LocalMediaStorage({ root: config.uploadsDir, publicBase: config.uploadsPublicPath }),
    secret: config.sessionSecret || store.meta.secret,
  };
}

/** Decorates a SiteRepository so every save notifies `onSaved` (used for auto-sync). */
function notifyingRepo(repo, onSaved) {
  return Object.assign(Object.create(repo), {
    async save(site) {
      await repo.save(site);
      onSaved(site);
    },
  });
}

async function buildContainer() {
  const { kind, siteRepo: rawSiteRepo, userRepo, submissionRepo, mediaStorage, secret } = await buildStorage();
  const archiveWriter = new ZipArchiveWriter();
  const deploymentService = new DeploymentService({ siteRepo: rawSiteRepo, mediaStorage });
  const siteRepo = notifyingRepo(rawSiteRepo, (site) => deploymentService.onSiteSaved(site));

  return {
    config,
    storageKind: kind,
    authService: new AuthService({
      userRepo,
      passwordHasher: new ScryptPasswordHasher(),
      tokenService: new HmacTokenService(secret),
      sessionTtlSeconds: config.sessionTtlSeconds,
    }),
    siteService: new SiteService({ siteRepo, submissionRepo, mediaStorage, templates }),
    pageService: new PageService({ siteRepo }),
    mediaService: new MediaService({ siteRepo, mediaStorage }),
    submissionService: new SubmissionService({ siteRepo, submissionRepo }),
    publishingService: new PublishingService({
      siteRepo, mediaStorage, renderer: siteRenderer, archiveWriter, sitePathPrefix: config.sitePathPrefix,
    }),
    sourceExportService: new SourceExportService({
      siteRepo, mediaStorage, archiveWriter,
      sourceTemplate: new SiteSourceTemplate({ templateDir: config.siteTemplateDir, coreSrcDir: config.coreSrcDir }),
    }),
    deploymentService,
    mediaStorage,
  };
}

async function start() {
  const container = await buildContainer();
  const admin = await container.authService.ensureInitialAdmin(config.initialAdmin.username, config.initialAdmin.password);
  if (admin) {
    console.log(`\n  Created admin user → username: ${config.initialAdmin.username}  password: ${config.initialAdmin.password}`);
    console.log('  Change the password under Account in the admin panel.');
  }
  const app = createApp(container);
  app.listen(config.port, () => {
    console.log(`\n  ${config.appName} is running (storage: ${container.storageKind})`);
    console.log(`  Admin panel → http://localhost:${config.port}/admin\n`);
  });
}

module.exports = { buildContainer, start };

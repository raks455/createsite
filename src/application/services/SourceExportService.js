'use strict';
// Builds the full source code of one website as a standalone TypeScript +
// Node.js + PostgreSQL project (ZIP), ready to push to GitHub and deploy on
// Render with a Neon database.
const Site = require('../../domain/entities/Site');
const { NotFoundError } = require('../../domain/errors');

class SourceExportService {
  /**
   * @param {{siteRepo: any, mediaStorage: any, archiveWriter: any, sourceTemplate: {files: (vars: object) => Promise<{name: string, content: string|Buffer}[]>}}} deps
   */
  constructor({ siteRepo, mediaStorage, archiveWriter, sourceTemplate }) {
    this.sites = siteRepo;
    this.media = mediaStorage;
    this.archive = archiveWriter;
    this.template = sourceTemplate;
  }

  filename(site) {
    return `${site.settings.general.slug}-source.zip`;
  }

  async exportSource(siteId, output) {
    const site = await this.sites.findById(siteId);
    if (!site) throw new NotFoundError('Site not found');
    const g = site.settings.general;
    const root = `${g.slug}/`;

    const entries = await this.template.files({ NAME: g.name, SLUG: g.slug });
    entries.push({ name: 'content/site.json', content: `${JSON.stringify(Site.publicCopy(site), null, 2)}\n` });
    for (const file of await this.media.readAll(siteId)) entries.push({ name: `content/media/${file.name}`, content: file.buffer });
    await this.archive.zip(entries.map((e) => ({ ...e, name: root + e.name })), output);
  }
}

module.exports = SourceExportService;

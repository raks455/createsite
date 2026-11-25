'use strict';
const Site = require('../../domain/entities/Site');
const { NotFoundError, ValidationError, ConflictError } = require('../../domain/errors');
const { isObject, slugify } = require('../../domain/util');

const PACKAGE_FORMAT = 'createsite-site';
const ACCEPTED_FORMATS = [PACKAGE_FORMAT, 'siteforge-site'];

class SiteService {
  /** @param {{siteRepo: any, submissionRepo: any, mediaStorage: any, templates: any}} deps */
  constructor({ siteRepo, submissionRepo, mediaStorage, templates }) {
    this.sites = siteRepo;
    this.submissions = submissionRepo;
    this.media = mediaStorage;
    this.templates = templates;
  }

  async list() {
    const all = await this.sites.findAll();
    return all.map(Site.summary).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async get(id) {
    const site = await this.sites.findById(id);
    if (!site) throw new NotFoundError('Site not found');
    return site;
  }

  listTemplates() {
    return this.templates.list();
  }

  async create({ name, template = 'blank' } = {}) {
    if (!String(name || '').trim()) throw new ValidationError('Please enter a site name');
    const { settings, pages } = this.templates.build(template, String(name).trim());
    const site = Site.createSite({ name, slug: name, settings, pages });
    site.settings.general.slug = await this.#uniqueSlug(site.settings.general.slug);
    await this.sites.save(site);
    return site;
  }

  async updateSettings(id, settingsPatch) {
    const site = await this.get(id);
    Site.applySettings(site, settingsPatch);
    await this.#assertUnique(site);
    await this.sites.save(site);
    return site;
  }

  async remove(id) {
    await this.get(id);
    await this.sites.delete(id);
    await this.submissions.deleteBySite(id);
    await this.media.removeAll(id);
  }

  async duplicate(id) {
    const source = await this.get(id);
    let copy = Site.copySite(source);
    const g = copy.settings.general;
    g.name = `${g.name} (copy)`;
    g.slug = await this.#uniqueSlug(slugify(`${g.slug}-copy`));
    g.domains = [];
    copy = this.#rewriteMediaUrls(copy, source.id, copy.id);
    await this.media.copyAll(source.id, copy.id);
    await this.sites.save(copy);
    return copy;
  }

  /** Portable JSON package: the site plus all of its media files (base64). */
  async exportPackage(id) {
    const site = await this.get(id);
    const files = await this.media.readAll(id);
    return {
      format: PACKAGE_FORMAT,
      version: 1,
      exportedAt: new Date().toISOString(),
      site: Site.publicCopy(site),
      media: files.map((f) => ({ name: f.name, data: f.buffer.toString('base64') })),
    };
  }

  async importPackage(pkg) {
    if (!isObject(pkg) || !ACCEPTED_FORMATS.includes(pkg.format) || !isObject(pkg.site)) {
      throw new ValidationError('This file is not a CreateSite site package');
    }
    const src = pkg.site;
    const name = src.settings?.general?.name || 'Imported site';
    let site = Site.createSite({ name, slug: src.settings?.general?.slug || name, settings: src.settings || {}, pages: Array.isArray(src.pages) ? src.pages : [] });
    site.settings.general.homePage = src.settings?.general?.homePage || '';
    site.settings.general.domains = [];
    Site.normalizeGeneral(site);
    site.settings.general.slug = await this.#uniqueSlug(site.settings.general.slug);
    if (src.id) site = this.#rewriteMediaUrls(site, src.id, site.id);
    const files = (Array.isArray(pkg.media) ? pkg.media : [])
      .filter((m) => m && typeof m.name === 'string' && typeof m.data === 'string')
      .map((m) => ({ name: m.name, buffer: Buffer.from(m.data, 'base64') }));
    await this.media.writeAll(site.id, files);
    await this.sites.save(site);
    return site;
  }

  // --- helpers -------------------------------------------------------------

  async #uniqueSlug(base) {
    const root = slugify(base) || 'site';
    let slug = root, i = 2;
    while (await this.sites.findBySlug(slug)) slug = `${root}-${i++}`;
    return slug;
  }

  async #assertUnique(site) {
    const g = site.settings.general;
    const other = await this.sites.findBySlug(g.slug);
    if (other && other.id !== site.id) throw new ConflictError(`The slug "${g.slug}" is already used by another site`);
    for (const d of g.domains) {
      const owner = await this.sites.findByDomain(d);
      if (owner && owner.id !== site.id) throw new ConflictError(`The domain ${d} is already used by "${owner.settings.general.name}"`);
    }
  }

  #rewriteMediaUrls(site, fromId, toId) {
    const from = this.media.publicPrefix(fromId);
    const to = this.media.publicPrefix(toId);
    return JSON.parse(JSON.stringify(site).split(from).join(to));
  }
}

module.exports = SiteService;

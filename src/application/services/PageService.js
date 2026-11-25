'use strict';
const Site = require('../../domain/entities/Site');
const { createPage, copyPage, createSection } = require('../../domain/entities/Page');
const { NotFoundError } = require('../../domain/errors');

class PageService {
  constructor({ siteRepo }) {
    this.sites = siteRepo;
  }

  async #site(siteId) {
    const site = await this.sites.findById(siteId);
    if (!site) throw new NotFoundError('Site not found');
    return site;
  }

  async create(siteId, { title, slug } = {}) {
    const site = await this.#site(siteId);
    const pageTitle = String(title || '').trim() || 'New page';
    const page = createPage({
      title: pageTitle,
      slug: slug || pageTitle,
      blocks: [createSection('hero', { title: pageTitle, eyebrow: '', subtitle: 'Add a short introduction for this page.', primaryText: '', secondaryText: '', minHeight: 0 }, { tone: 'surface' })],
    });
    Site.addPage(site, page);
    await this.sites.save(site);
    return page;
  }

  async update(siteId, pageId, input) {
    const site = await this.#site(siteId);
    const page = Site.updatePage(site, pageId, input || {});
    await this.sites.save(site);
    return page;
  }

  async remove(siteId, pageId) {
    const site = await this.#site(siteId);
    Site.removePage(site, pageId);
    await this.sites.save(site);
  }

  async duplicate(siteId, pageId) {
    const site = await this.#site(siteId);
    const original = Site.findPage(site, pageId);
    const copy = copyPage(original);
    copy.title = `${original.title} (copy)`;
    copy.slug = `${original.slug}-copy`;
    Site.addPage(site, copy, site.pages.indexOf(original) + 1);
    await this.sites.save(site);
    return copy;
  }

  async reorder(siteId, ids) {
    const site = await this.#site(siteId);
    Site.reorderPages(site, ids);
    await this.sites.save(site);
    return site.pages.map((p) => p.id);
  }

  async setHome(siteId, pageId) {
    const site = await this.#site(siteId);
    Site.findPage(site, pageId);
    Site.applySettings(site, { general: { homePage: pageId } });
    await this.sites.save(site);
    return site;
  }
}

module.exports = PageService;

'use strict';
// Use cases for delivering sites: public page requests, live preview, static export.
const Site = require('../../domain/entities/Site');
const { normalizePage } = require('../../domain/entities/Page');
const { resolveSettings } = require('../../domain/content/siteSettings');
const { NotFoundError } = require('../../domain/errors');
const { clone, cleanDomain } = require('../../domain/util');

class PublishingService {
  constructor({ siteRepo, renderer, mediaStorage, archiveWriter, sitePathPrefix = '/s' }) {
    this.sites = siteRepo;
    this.renderer = renderer;
    this.media = mediaStorage;
    this.archive = archiveWriter;
    this.prefix = sitePathPrefix;
  }

  basePath(site) {
    return `${this.prefix}/${site.settings.general.slug}`;
  }

  findBySlug(slug) {
    return this.sites.findBySlug(String(slug || '').toLowerCase());
  }

  findByDomain(host) {
    return this.sites.findByDomain(cleanDomain(host));
  }

  /**
   * Resolves a public request path to a response.
   * @returns {{status: number, contentType: string, body: string}}
   */
  resolve(site, rawPath, { base, viewer = null, origin = '' }) {
    const path = String(rawPath || '').replace(/^\/+|\/+$/g, '').toLowerCase();
    const g = resolveSettings(site.settings).general;
    const html = (status, body) => ({ status, contentType: 'text/html; charset=utf-8', body });

    if (path === 'robots.txt') {
      const noindex = resolveSettings(site.settings).seo.noindex;
      return { status: 200, contentType: 'text/plain', body: `User-agent: *\n${noindex ? 'Disallow: /' : 'Allow: /'}\nSitemap: ${origin}${base}/sitemap.xml\n` };
    }
    if (path === 'sitemap.xml') {
      const urls = site.pages.filter((p) => p.published && p.slug !== '404')
        .map((p) => `<url><loc>${origin}${base}/${Site.isHome(site, p) ? '' : p.slug}</loc></url>`).join('');
      return { status: 200, contentType: 'application/xml', body: `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>` };
    }
    if (g.maintenance && !viewer) return html(503, this.renderer.renderSpecial({ site, kind: 'maintenance', base }));

    const page = Site.findPageByPath(site, path);
    if (!page || (!page.published && !viewer)) return html(404, this.renderer.renderSpecial({ site, kind: '404', base }));
    return html(200, this.renderer.renderPage({ site, page, base, mode: 'live' }));
  }

  /** Renders unsaved drafts (settings and/or a page) for the editor preview. */
  async preview(siteId, { settings, page, pageId } = {}) {
    const stored = await this.sites.findById(siteId);
    if (!stored) throw new NotFoundError('Site not found');
    const site = clone(stored);
    if (settings && typeof settings === 'object') site.settings = resolveSettings(settings);
    let target;
    if (page && typeof page === 'object') {
      target = normalizePage(page, page.id ? { id: page.id } : null);
      const i = site.pages.findIndex((p) => p.id === target.id);
      if (i >= 0) site.pages[i] = target; else site.pages.push(target);
    } else {
      target = (pageId && site.pages.find((p) => p.id === pageId)) || Site.homePage(site);
    }
    return this.renderer.renderPage({ site, page: target, base: this.basePath(stored), mode: 'preview' });
  }

  /** Writes a ZIP of the site as static HTML (deployable to any web host). */
  async exportStatic(siteId, output) {
    const site = await this.sites.findById(siteId);
    if (!site) throw new NotFoundError('Site not found');
    const entries = [];
    for (const page of site.pages.filter((p) => p.published)) {
      const name = Site.isHome(site, page) ? 'index.html' : page.slug === '404' ? '404.html' : `${page.slug}/index.html`;
      entries.push({ name, content: this.renderer.renderPage({ site, page, base: '', mode: 'export' }) });
    }
    if (!entries.some((e) => e.name === '404.html')) {
      entries.push({ name: '404.html', content: this.renderer.renderSpecial({ site, kind: '404', base: '', mode: 'export' }) });
    }
    const prefix = this.media.publicPrefix(siteId).replace(/^\/+/, '');
    for (const file of await this.media.readAll(siteId)) entries.push({ name: prefix + file.name, content: file.buffer });
    await this.archive.zip(entries, output);
  }

  exportFilename(site) {
    return `${site.settings.general.slug}-site.zip`;
  }
}

module.exports = PublishingService;

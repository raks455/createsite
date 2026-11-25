'use strict';
// Site aggregate: settings + ordered pages. All invariants about a single site
// live here (slugs, home page, at least one page). Cross-site rules (unique
// slug/domains) belong to the application layer because they need a repository.
const { SITE_SETTINGS, resolveSettings } = require('../content/siteSettings');
const { normalizePage, createPage } = require('./Page');
const { ValidationError, NotFoundError } = require('../errors');
const { newId, clone, isObject, now, slugify, cleanDomain } = require('../util');

function createSite({ name, slug, settings = {}, pages = [] }) {
  const site = {
    id: newId('s_'),
    settings: resolveSettings(settings),
    pages: (pages.length ? pages : [createPage({ title: 'Home', slug: 'home' })]).map((p) => normalizePage(p, p.id ? { id: p.id } : null)),
    createdAt: now(),
    updatedAt: now(),
  };
  const g = site.settings.general;
  g.name = String(name || g.name).trim() || 'My Site';
  g.slug = slugify(slug || g.name) || 'site';
  normalizeGeneral(site);
  return site;
}

function normalizeGeneral(site) {
  const g = site.settings.general;
  g.name = String(g.name || '').trim() || 'Untitled site';
  g.slug = slugify(g.slug) || slugify(g.name) || 'site';
  const domains = Array.isArray(g.domains) ? g.domains : String(g.domains || '').split(/[\s,]+/);
  g.domains = [...new Set(domains.map(cleanDomain).filter(Boolean))];
  if (!site.pages.some((p) => p.id === g.homePage)) g.homePage = site.pages[0] ? site.pages[0].id : '';
}

/** Merges a partial settings object ({ theme: {...}, header: {...} }). */
function applySettings(site, patch) {
  if (!isObject(patch)) throw new ValidationError('settings must be an object');
  const current = resolveSettings(site.settings);
  for (const [group, values] of Object.entries(patch)) {
    if (!SITE_SETTINGS[group] || !isObject(values)) continue;
    current[group] = { ...current[group], ...values };
  }
  site.settings = current;
  normalizeGeneral(site);
  touch(site);
  return site;
}

const touch = (site) => { site.updatedAt = now(); };
const homePage = (site) => site.pages.find((p) => p.id === site.settings.general.homePage) || site.pages[0] || null;
const isHome = (site, page) => !!page && homePage(site)?.id === page.id;

function findPage(site, pageId) {
  const page = site.pages.find((p) => p.id === pageId);
  if (!page) throw new NotFoundError('Page not found');
  return page;
}

function findPageByPath(site, path) {
  if (!path) return homePage(site);
  return site.pages.find((p) => p.slug === path) || null;
}

function uniquePageSlug(site, slug, exceptId) {
  let s = slug, i = 2;
  while (site.pages.some((p) => p.id !== exceptId && p.slug === s)) s = `${slug}-${i++}`;
  return s;
}

function addPage(site, page, index = site.pages.length) {
  page.slug = uniquePageSlug(site, page.slug, page.id);
  site.pages.splice(index, 0, page);
  touch(site);
  return page;
}

function updatePage(site, pageId, input) {
  const existing = findPage(site, pageId);
  const page = normalizePage(input, existing);
  page.slug = uniquePageSlug(site, page.slug, page.id);
  site.pages[site.pages.indexOf(existing)] = page;
  touch(site);
  return page;
}

function removePage(site, pageId) {
  findPage(site, pageId);
  if (site.pages.length <= 1) throw new ValidationError('A site needs at least one page');
  site.pages = site.pages.filter((p) => p.id !== pageId);
  normalizeGeneral(site);
  touch(site);
}

function reorderPages(site, ids) {
  if (!Array.isArray(ids)) throw new ValidationError('ids must be an array');
  const pos = (p) => { const i = ids.indexOf(p.id); return i < 0 ? Infinity : i; };
  site.pages.sort((a, b) => pos(a) - pos(b));
  touch(site);
}

/** Deep copy with a new id (page ids are kept; they are only unique per site). */
function copySite(site) {
  const c = clone(site);
  c.id = newId('s_');
  c.createdAt = c.updatedAt = now();
  return c;
}

function summary(site) {
  const g = resolveSettings(site.settings).general;
  return {
    id: site.id, name: g.name, slug: g.slug, domains: g.domains, maintenance: g.maintenance,
    pageCount: site.pages.length, createdAt: site.createdAt, updatedAt: site.updatedAt,
  };
}

module.exports = {
  createSite, applySettings, normalizeGeneral, homePage, isHome, findPage, findPageByPath,
  uniquePageSlug, addPage, updatePage, removePage, reorderPages, copySite, summary, touch,
};

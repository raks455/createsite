'use strict';
const { SECTION_TYPES } = require('../content/sectionTypes');
const { ValidationError } = require('../errors');
const { newId, clone, isObject, slugify } = require('../util');

const PAGE_KEYS = ['title', 'slug', 'published', 'seoTitle', 'seoDescription', 'seoImage', 'hideHeader', 'hideFooter', 'bodyClass', 'css'];
const BOOL_KEYS = ['published', 'hideHeader', 'hideFooter'];

const EMPTY_PAGE = {
  title: 'Untitled', slug: '', published: true, seoTitle: '', seoDescription: '', seoImage: '',
  hideHeader: false, hideFooter: false, bodyClass: '', css: '', blocks: [],
};

/** Creates a new section with default content for its type. */
function createSection(type, data = {}, style = {}) {
  const def = SECTION_TYPES[type];
  if (!def) throw new ValidationError(`Unknown section type "${type}"`);
  return {
    id: newId('b_'),
    type,
    data: { ...clone(def.defaults), ...data },
    style: { ...clone(def.defaultStyle || {}), ...style },
  };
}

function normalizeSection(input) {
  if (!isObject(input) || typeof input.type !== 'string') throw new ValidationError('Invalid section');
  return {
    id: typeof input.id === 'string' && input.id ? input.id.slice(0, 40) : newId('b_'),
    type: input.type,
    data: isObject(input.data) ? input.data : {},
    style: isObject(input.style) ? input.style : {},
  };
}

/** Validates/merges page input on top of an existing page (or a blank one). */
function normalizePage(input = {}, existing = null) {
  const page = { ...EMPTY_PAGE, ...(existing || {}) };
  for (const k of PAGE_KEYS) if (input[k] !== undefined) page[k] = input[k];
  for (const k of BOOL_KEYS) page[k] = !!page[k];
  for (const k of PAGE_KEYS) if (!BOOL_KEYS.includes(k)) page[k] = String(page[k] ?? '');
  page.title = page.title.trim() || 'Untitled';
  page.slug = slugify(page.slug, { allowSlash: true }) || slugify(page.title) || 'page';
  if (Array.isArray(input.blocks)) page.blocks = input.blocks.map(normalizeSection);
  page.id = (existing && existing.id) || (typeof input.id === 'string' && input.id) || newId('p_');
  return page;
}

function createPage(input = {}) {
  return normalizePage({ ...input, id: undefined });
}

/** Deep copy with fresh ids for the page and all sections. */
function copyPage(page) {
  const c = clone(page);
  c.id = newId('p_');
  c.blocks.forEach((b) => { b.id = newId('b_'); });
  return c;
}

module.exports = { createSection, normalizeSection, normalizePage, createPage, copyPage };

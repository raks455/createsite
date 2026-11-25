'use strict';
const crypto = require('crypto');

const newId = (prefix = '') => prefix + crypto.randomBytes(6).toString('hex');
const clone = (o) => (o === undefined ? undefined : JSON.parse(JSON.stringify(o)));
const isObject = (o) => o !== null && typeof o === 'object' && !Array.isArray(o);
const now = () => new Date().toISOString();

function slugify(input, { allowSlash = false } = {}) {
  const re = allowSlash ? /[^a-z0-9/-]+/g : /[^a-z0-9-]+/g;
  return String(input || '')
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().trim()
    .replace(re, '-')
    .replace(/-+/g, '-')
    .replace(/\/+/g, '/')
    .replace(/(^|\/)-+|-+($|\/)/g, '$1$2')
    .replace(/^\/+|\/+$/g, '');
}

function cleanDomain(d) {
  return String(d || '').trim().toLowerCase()
    .replace(/^[a-z]+:\/\//, '').replace(/\/.*$/, '').replace(/:\d+$/, '');
}

module.exports = { newId, clone, isObject, now, slugify, cleanDomain };

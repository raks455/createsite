'use strict';
const { ValidationError } = require('../errors');
const { newId, now } = require('../util');

const MAX_FIELDS = 40;
const MAX_VALUE = 5000;

/** Form entry sent by a visitor. Keys starting with "_" are meta fields and are dropped. */
function createSubmission({ siteId, pageId = '', blockId = '', fields = {}, ip = '' }) {
  const data = {};
  for (const [k, v] of Object.entries(fields).slice(0, MAX_FIELDS * 2)) {
    if (k.startsWith('_')) continue;
    if (Object.keys(data).length >= MAX_FIELDS) break;
    data[String(k).slice(0, 60)] = (Array.isArray(v) ? v.join(', ') : String(v ?? '')).slice(0, MAX_VALUE);
  }
  if (!Object.values(data).some((v) => v.trim())) throw new ValidationError('The form is empty');
  return { id: newId('f_'), siteId, pageId: String(pageId).slice(0, 40), blockId: String(blockId).slice(0, 40), data, ip, createdAt: now() };
}

module.exports = { createSubmission };

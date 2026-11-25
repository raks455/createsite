'use strict';
// Field descriptors. The admin panel generates every form from these.
//
// Types: text, textarea, richtext, code, number, toggle, select, color,
//        image, url, font, page, lines, list (with nested `fields`)
const f = (key, label, type = 'text', extra = {}) => ({ key, label, type, ...extra });
const list = (key, label, fields, item = {}, extra = {}) => ({ key, label, type: 'list', fields, item, ...extra });
const emptyValue = (fd) => (fd.type === 'list' || fd.type === 'lines' ? [] : fd.type === 'toggle' ? false : '');

module.exports = { f, list, emptyValue };

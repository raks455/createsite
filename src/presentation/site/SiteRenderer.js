'use strict';
// Implements the SiteRenderer port with the TypeScript core renderer
// (core/src/render). The same code ships inside every exported site.
const { renderPage, renderSpecial, resolveRequest, FONT_LIST } = require('../../../core/dist');

module.exports = { renderPage, renderSpecial, resolveRequest, FONT_LIST };

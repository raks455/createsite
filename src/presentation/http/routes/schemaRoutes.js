'use strict';
// Exposes the content model so the admin panel can build its forms.
const express = require('express');
const { SECTION_TYPES } = require('../../../domain/content/sectionTypes');
const { SITE_SETTINGS, PAGE_FIELDS, SECTION_STYLE_FIELDS } = require('../../../domain/content/siteSettings');
const { FONT_LIST } = require('../../site/fonts');

module.exports = function schemaRoutes({ siteService }) {
  const r = express.Router();
  r.get('/schema', (req, res) => {
    const sections = Object.fromEntries(Object.entries(SECTION_TYPES).map(([type, d]) => [type, { type, ...d }]));
    res.json({
      sections,
      siteSettings: SITE_SETTINGS,
      pageFields: PAGE_FIELDS,
      sectionStyleFields: SECTION_STYLE_FIELDS,
      templates: siteService.listTemplates(),
      fonts: FONT_LIST,
    });
  });
  return r;
};

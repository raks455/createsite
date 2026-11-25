'use strict';
const express = require('express');
const { asyncHandler: ah } = require('../middleware');

module.exports = function siteRoutes({ siteService, pageService, publishingService, sourceExportService }) {
  const r = express.Router();

  // --- Sites ---------------------------------------------------------------
  r.get('/sites', ah(async (req, res) => {
    const sites = await siteService.list();
    res.json(sites.map((s) => ({ ...s, url: `/s/${s.slug}/` })));
  }));
  r.post('/sites', ah(async (req, res) => res.status(201).json(await siteService.create(req.body))));
  r.post('/sites/import', ah(async (req, res) => res.status(201).json(await siteService.importPackage(req.body?.package ?? req.body))));
  r.get('/sites/:id', ah(async (req, res) => res.json(await siteService.get(req.params.id))));
  r.put('/sites/:id', ah(async (req, res) => res.json(await siteService.updateSettings(req.params.id, req.body?.settings))));
  r.delete('/sites/:id', ah(async (req, res) => {
    await siteService.remove(req.params.id);
    res.json({ ok: true });
  }));
  r.post('/sites/:id/duplicate', ah(async (req, res) => res.status(201).json(await siteService.duplicate(req.params.id))));

  r.get('/sites/:id/export.json', ah(async (req, res) => {
    const pkg = await siteService.exportPackage(req.params.id);
    res.attachment(`${pkg.site.settings.general.slug}.createsite.json`).json(pkg);
  }));
  r.get('/sites/:id/export.zip', ah(async (req, res) => {
    const site = await siteService.get(req.params.id);
    res.attachment(publishingService.exportFilename(site));
    await publishingService.exportStatic(site.id, res);
  }));

  // Full source code: TypeScript + Node.js + PostgreSQL project, ready for Render + Neon
  r.get('/sites/:id/export-source.zip', ah(async (req, res) => {
    const site = await siteService.get(req.params.id);
    res.attachment(sourceExportService.filename(site));
    await sourceExportService.exportSource(site.id, res);
  }));

  r.post('/sites/:id/preview', ah(async (req, res) => {
    res.type('html').send(await publishingService.preview(req.params.id, req.body || {}));
  }));

  // --- Pages ---------------------------------------------------------------
  r.post('/sites/:id/pages', ah(async (req, res) => res.status(201).json(await pageService.create(req.params.id, req.body))));
  r.put('/sites/:id/pages-order', ah(async (req, res) => res.json(await pageService.reorder(req.params.id, req.body?.ids))));
  r.put('/sites/:id/pages/:pageId', ah(async (req, res) => res.json(await pageService.update(req.params.id, req.params.pageId, req.body))));
  r.delete('/sites/:id/pages/:pageId', ah(async (req, res) => {
    await pageService.remove(req.params.id, req.params.pageId);
    res.json({ ok: true });
  }));
  r.post('/sites/:id/pages/:pageId/duplicate', ah(async (req, res) => res.status(201).json(await pageService.duplicate(req.params.id, req.params.pageId))));
  r.post('/sites/:id/pages/:pageId/home', ah(async (req, res) => res.json(await pageService.setHome(req.params.id, req.params.pageId))));

  return r;
};

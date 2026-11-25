'use strict';
// Serves the generated websites: /s/<slug>/... and custom domains at the root.
const express = require('express');
const { asyncHandler: ah } = require('../middleware');

module.exports = function publicRoutes({ publishingService, submissionService }) {
  async function serve(site, base, path, req, res) {
    if (path.replace(/^\/+|\/+$/g, '') === '__form') {
      if (req.method !== 'POST') return res.status(405).end();
      await submissionService.submit(site.id, req.body || {}, { ip: req.ip });
      if (req.accepts(['html', 'json']) === 'json') return res.json({ ok: true });
      return res.redirect(303, req.get('referer') || `${base}/`);
    }
    if (!['GET', 'HEAD'].includes(req.method)) return res.status(405).end();
    const origin = `${req.protocol}://${req.get('host')}`;
    const result = publishingService.resolve(site, path, { base, viewer: req.user, origin });
    res.status(result.status).type(result.contentType).send(result.body);
  }

  /** Must be mounted after /api, /admin and /uploads. */
  const domainRouter = ah(async (req, res, next) => {
    const site = await publishingService.findByDomain(req.hostname);
    if (!site) return next();
    await serve(site, '', req.path, req, res);
  });

  const slugRouter = express.Router();
  slugRouter.all(['/s/:slug', '/s/:slug/*'], ah(async (req, res, next) => {
    const site = await publishingService.findBySlug(req.params.slug);
    if (!site) return next();
    let path = req.params[0] || '';
    try { path = decodeURIComponent(path); } catch {}
    await serve(site, `/s/${site.settings.general.slug}`, path, req, res);
  }));

  return { domainRouter, slugRouter };
};

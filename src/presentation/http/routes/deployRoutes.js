'use strict';
// Connected deployment: push a site's content to its deployed TypeScript app.
const express = require('express');
const { asyncHandler: ah } = require('../middleware');

module.exports = function deployRoutes({ deploymentService }) {
  const r = express.Router();
  r.get('/sites/:id/deploy', ah(async (req, res) => res.json(await deploymentService.get(req.params.id))));
  r.put('/sites/:id/deploy', ah(async (req, res) => res.json(await deploymentService.configure(req.params.id, req.body || {}))));
  r.post('/sites/:id/deploy/test', ah(async (req, res) => res.json(await deploymentService.test(req.params.id))));
  r.post('/sites/:id/deploy/push', ah(async (req, res) => res.json(await deploymentService.push(req.params.id))));
  r.get('/sites/:id/deploy/submissions', ah(async (req, res) => res.json(await deploymentService.submissions(req.params.id))));
  return r;
};

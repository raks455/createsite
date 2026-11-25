'use strict';
const express = require('express');
const { asyncHandler: ah } = require('../middleware');

module.exports = function submissionRoutes({ submissionService }) {
  const r = express.Router();
  r.get('/sites/:id/submissions', ah(async (req, res) => res.json(await submissionService.list(req.params.id))));
  r.delete('/sites/:id/submissions', ah(async (req, res) => {
    await submissionService.clear(req.params.id);
    res.json({ ok: true });
  }));
  r.delete('/sites/:id/submissions/:subId', ah(async (req, res) => {
    await submissionService.remove(req.params.id, req.params.subId);
    res.json({ ok: true });
  }));
  return r;
};

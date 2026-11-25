'use strict';
const express = require('express');
const multer = require('multer');
const { asyncHandler: ah } = require('../middleware');

module.exports = function mediaRoutes({ mediaService, config }) {
  const r = express.Router();
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: config.maxUploadBytes, files: 30 } });

  r.get('/sites/:id/media', ah(async (req, res) => res.json(await mediaService.list(req.params.id))));

  r.post('/sites/:id/media', upload.array('files', 30), ah(async (req, res) => {
    const files = (req.files || []).map((f) => ({ originalName: f.originalname, buffer: f.buffer }));
    res.status(201).json(await mediaService.upload(req.params.id, files));
  }));

  r.delete('/sites/:id/media/:name', ah(async (req, res) => {
    await mediaService.remove(req.params.id, req.params.name);
    res.json({ ok: true });
  }));

  return r;
};

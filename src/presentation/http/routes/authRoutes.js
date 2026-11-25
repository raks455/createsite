'use strict';
const express = require('express');
const { asyncHandler: ah } = require('../middleware');

module.exports = function authRoutes({ authService }, auth) {
  const r = express.Router();

  r.post('/login', ah(async (req, res) => {
    const { user, token } = await authService.login(req.body?.username, req.body?.password);
    auth.setSession(req, res, token);
    res.json({ user });
  }));

  r.post('/logout', (req, res) => {
    auth.clearSession(res);
    res.json({ ok: true });
  });

  r.get('/me', auth.requireAuth, (req, res) => res.json({ user: req.user }));

  r.post('/me/password', auth.requireAuth, ah(async (req, res) => {
    const { token } = await authService.changePassword(req.user.id, req.body?.current, req.body?.password);
    auth.setSession(req, res, token);
    res.json({ ok: true });
  }));

  r.get('/users', auth.requireAuth, ah(async (req, res) => res.json(await authService.listUsers())));
  r.post('/users', auth.requireAuth, ah(async (req, res) => res.status(201).json(await authService.createUser(req.body?.username, req.body?.password))));
  r.delete('/users/:id', auth.requireAuth, ah(async (req, res) => {
    await authService.deleteUser(req.params.id, req.user.id);
    res.json({ ok: true });
  }));

  return r;
};

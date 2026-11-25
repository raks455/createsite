'use strict';
// Connects a site in the builder to its deployed copy (the exported TypeScript
// app running on Render, Vercel, a VPS…). Pushing sends the content and any new
// media files to the deployed site's /_createsite API, so edits go live without
// a redeploy. With auto-sync on, every save is pushed a few seconds later.
const Site = require('../../domain/entities/Site');
const { NotFoundError, ValidationError, AppError } = require('../../domain/errors');

class DeployError extends AppError {
  constructor(message) { super(message, 502, 'DEPLOY_FAILED'); }
}

const cleanUrl = (u) => String(u || '').trim().replace(/\/+$/, '');

class DeploymentService {
  /** @param {{siteRepo: any, mediaStorage: any, fetch?: typeof fetch, autoSyncDelayMs?: number}} deps */
  constructor({ siteRepo, mediaStorage, fetch: fetchImpl = globalThis.fetch, autoSyncDelayMs = 4000 }) {
    this.sites = siteRepo;
    this.media = mediaStorage;
    this.fetch = fetchImpl;
    this.delay = autoSyncDelayMs;
    this.timers = new Map();
  }

  async #site(siteId) {
    const site = await this.sites.findById(siteId);
    if (!site) throw new NotFoundError('Site not found');
    return site;
  }

  #view(site) {
    const d = site.deploy || {};
    return {
      url: d.url || '', hasToken: !!d.token, autoSync: !!d.autoSync,
      lastSyncAt: d.lastSyncAt || null, lastError: d.lastError || null,
      upToDate: !!d.syncedVersion && d.syncedVersion === site.updatedAt,
    };
  }

  async get(siteId) {
    return this.#view(await this.#site(siteId));
  }

  /** Saves URL, token (kept if left empty) and auto-sync. */
  async configure(siteId, { url, token, autoSync } = {}) {
    const site = await this.#site(siteId);
    const next = cleanUrl(url);
    if (next && !/^https?:\/\/[^\s/]+/i.test(next)) throw new ValidationError('Enter the full URL, e.g. https://my-site.onrender.com');
    site.deploy = {
      ...(site.deploy || {}),
      url: next,
      token: token ? String(token).trim() : site.deploy?.token || '',
      autoSync: !!autoSync,
    };
    await this.sites.save(site);
    return this.#view(site);
  }

  async #call(site, method, path, { json, body, type } = {}) {
    const { url, token } = site.deploy || {};
    if (!url || !token) throw new ValidationError('Add the deployed site URL and its ADMIN_TOKEN first');
    let res;
    try {
      res = await this.fetch(`${url}/_createsite${path}`, {
        method,
        headers: { Authorization: `Bearer ${token}`, ...(json !== undefined ? { 'Content-Type': 'application/json' } : type ? { 'Content-Type': type } : {}) },
        body: json !== undefined ? JSON.stringify(json) : body,
        signal: AbortSignal.timeout(60000),
      });
    } catch (e) {
      throw new DeployError(`Could not reach ${url}: ${e.cause?.code || e.message}`);
    }
    const data = await res.json().catch(() => null);
    if (res.status === 401) throw new DeployError('The deployed site rejected the token. Check ADMIN_TOKEN in your host settings.');
    if (!res.ok) throw new DeployError(data?.error || `The deployed site answered ${res.status}`);
    return data;
  }

  /** Checks the connection and returns what is currently deployed. */
  async test(siteId) {
    const site = await this.#site(siteId);
    const status = await this.#call(site, 'GET', '/status');
    return { ok: true, name: status.name, contentVersion: status.contentVersion, mediaCount: status.media.length };
  }

  /** Pushes content + changed media to the deployed site. */
  async push(siteId) {
    const site = await this.#site(siteId);
    try {
      const status = await this.#call(site, 'GET', '/status');
      const remote = new Map(status.media.map((m) => [m.name, m.size]));
      const local = await this.media.list(siteId);
      let uploaded = 0;
      for (const file of local) {
        if (remote.get(file.name) === file.size) continue;
        const data = await this.media.read(siteId, file.name);
        if (!data) continue;
        await this.#call(site, 'PUT', `/media/${encodeURIComponent(file.name)}`, { body: data.buffer, type: data.type });
        uploaded++;
      }
      const result = await this.#call(site, 'PUT', '/content', { json: { site: Site.publicCopy(site), keepMedia: local.map((f) => f.name) } });
      await this.#record(siteId, { lastSyncAt: new Date().toISOString(), lastError: null, syncedVersion: site.updatedAt });
      return { ok: true, uploadedMedia: uploaded, removedMedia: result.removedMedia || 0 };
    } catch (e) {
      await this.#record(siteId, { lastError: e.message });
      throw e;
    }
  }

  /** Form entries stored by the deployed site. */
  async submissions(siteId) {
    return this.#call(await this.#site(siteId), 'GET', '/submissions');
  }

  /** Called after any site save (wired in main.js). Debounces an automatic push. */
  onSiteSaved(site) {
    const d = site.deploy;
    if (!d?.autoSync || !d.url || !d.token || d.syncedVersion === site.updatedAt) return;
    clearTimeout(this.timers.get(site.id));
    this.timers.set(site.id, setTimeout(() => {
      this.timers.delete(site.id);
      this.push(site.id).catch((e) => console.warn(`Auto-sync of ${site.id} failed: ${e.message}`));
    }, this.delay).unref());
  }

  // Writes sync status without touching updatedAt (so it doesn't trigger another sync).
  async #record(siteId, patch) {
    const fresh = await this.sites.findById(siteId);
    if (!fresh) return;
    fresh.deploy = { ...(fresh.deploy || {}), ...patch };
    await this.sites.save(fresh);
  }
}

module.exports = DeploymentService;

'use strict';
// MediaStorage adapter that keeps files on local disk: <root>/<siteId>/<file>
// and serves them at <publicBase>/<siteId>/<file>.
const fs = require('fs/promises');
const path = require('path');

const MIME = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
  '.avif': 'image/avif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.mov': 'video/quicktime', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.pdf': 'application/pdf',
};

const safeName = (name) => path.basename(String(name || ''));
const exists = (p) => fs.access(p).then(() => true, () => false);

class LocalMediaStorage {
  constructor({ root, publicBase = '/uploads' }) {
    this.root = root;
    this.publicBase = publicBase.replace(/\/+$/, '');
  }

  dir(siteId) {
    return path.join(this.root, safeName(siteId));
  }

  publicPrefix(siteId) {
    return `${this.publicBase}/${siteId}/`;
  }

  #info(siteId, name, stat) {
    return {
      name,
      url: this.publicPrefix(siteId) + encodeURIComponent(name),
      size: stat.size,
      type: MIME[path.extname(name).toLowerCase()] || 'application/octet-stream',
      modifiedAt: stat.mtime.toISOString(),
    };
  }

  async list(siteId) {
    const dir = this.dir(siteId);
    if (!(await exists(dir))) return [];
    const names = await fs.readdir(dir);
    const files = await Promise.all(names.map(async (n) => this.#info(siteId, n, await fs.stat(path.join(dir, n)))));
    return files.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
  }

  async save(siteId, originalName, buffer) {
    const ext = path.extname(originalName).toLowerCase().replace(/[^.a-z0-9]/g, '');
    const stem = path.basename(originalName, path.extname(originalName)).toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'file';
    const name = `${stem}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}${ext}`;
    const dir = this.dir(siteId);
    await fs.mkdir(dir, { recursive: true });
    const file = path.join(dir, name);
    await fs.writeFile(file, buffer);
    return this.#info(siteId, name, await fs.stat(file));
  }

  async remove(siteId, name) {
    await fs.rm(path.join(this.dir(siteId), safeName(name)), { force: true });
  }

  async removeAll(siteId) {
    await fs.rm(this.dir(siteId), { recursive: true, force: true });
  }

  async copyAll(fromId, toId) {
    if (await exists(this.dir(fromId))) await fs.cp(this.dir(fromId), this.dir(toId), { recursive: true });
  }

  async readAll(siteId) {
    const dir = this.dir(siteId);
    if (!(await exists(dir))) return [];
    const names = await fs.readdir(dir);
    return Promise.all(names.map(async (name) => ({ name, buffer: await fs.readFile(path.join(dir, name)) })));
  }

  async writeAll(siteId, files) {
    if (!files.length) return;
    const dir = this.dir(siteId);
    await fs.mkdir(dir, { recursive: true });
    for (const f of files) await fs.writeFile(path.join(dir, safeName(f.name)), f.buffer);
  }
}

module.exports = LocalMediaStorage;

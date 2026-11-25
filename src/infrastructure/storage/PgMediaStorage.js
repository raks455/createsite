'use strict';
// MediaStorage adapter that keeps uploaded files inside PostgreSQL (BYTEA).
// Render's free plan has no persistent disk, so media lives next to the
// content in the database and survives redeploys.
const { mimeOf, safeName, uniqueFileName } = require('./files');

class PgMediaStorage {
  constructor(db, { publicBase = '/uploads' } = {}) {
    this.db = db;
    this.publicBase = publicBase.replace(/\/+$/, '');
  }

  publicPrefix(siteId) {
    return `${this.publicBase}/${siteId}/`;
  }

  #info(siteId, r) {
    return {
      name: r.name,
      url: this.publicPrefix(siteId) + encodeURIComponent(r.name),
      size: r.size,
      type: r.type,
      modifiedAt: new Date(r.modified_at).toISOString(),
    };
  }

  async list(siteId) {
    const r = await this.db.query('SELECT name, type, size, modified_at FROM pw_media WHERE site_id = $1 ORDER BY modified_at DESC', [siteId]);
    return r.rows.map((row) => this.#info(siteId, row));
  }

  async read(siteId, name) {
    const r = await this.db.query('SELECT type, data FROM pw_media WHERE site_id = $1 AND name = $2', [siteId, safeName(name)]);
    return r.rows[0] ? { buffer: r.rows[0].data, type: r.rows[0].type } : null;
  }

  async #put(siteId, name, buffer) {
    const r = await this.db.query(
      `INSERT INTO pw_media (site_id, name, type, size, data, modified_at) VALUES ($1, $2, $3, $4, $5, now())
       ON CONFLICT (site_id, name) DO UPDATE SET type = EXCLUDED.type, size = EXCLUDED.size, data = EXCLUDED.data, modified_at = now()
       RETURNING name, type, size, modified_at`,
      [siteId, name, mimeOf(name), buffer.length, buffer],
    );
    return this.#info(siteId, r.rows[0]);
  }

  save(siteId, originalName, buffer) {
    return this.#put(siteId, uniqueFileName(originalName), buffer);
  }

  async remove(siteId, name) {
    await this.db.query('DELETE FROM pw_media WHERE site_id = $1 AND name = $2', [siteId, safeName(name)]);
  }

  async removeAll(siteId) {
    await this.db.query('DELETE FROM pw_media WHERE site_id = $1', [siteId]);
  }

  async copyAll(fromId, toId) {
    await this.db.query(
      `INSERT INTO pw_media (site_id, name, type, size, data, modified_at)
       SELECT $2, name, type, size, data, now() FROM pw_media WHERE site_id = $1
       ON CONFLICT (site_id, name) DO NOTHING`,
      [fromId, toId],
    );
  }

  async readAll(siteId) {
    const r = await this.db.query('SELECT name, data FROM pw_media WHERE site_id = $1', [siteId]);
    return r.rows.map((row) => ({ name: row.name, buffer: row.data }));
  }

  async writeAll(siteId, files) {
    for (const f of files) await this.#put(siteId, safeName(f.name), f.buffer);
  }
}

module.exports = PgMediaStorage;

'use strict';
// Repository implementations on PostgreSQL. Same interface as the JSON-file
// repositories (see application/ports.js), so services don't know the difference.
const rows = (r) => r.rows.map((x) => x.data);
const one = (r) => (r.rows[0] ? r.rows[0].data : null);

class PgSiteRepository {
  constructor(db) { this.db = db; }
  async findAll() { return rows(await this.db.query('SELECT data FROM pw_sites ORDER BY updated_at DESC')); }
  async findById(id) { return one(await this.db.query('SELECT data FROM pw_sites WHERE id = $1', [id])); }
  async findBySlug(slug) { return one(await this.db.query('SELECT data FROM pw_sites WHERE slug = $1', [slug])); }
  async findByDomain(host) {
    if (!host) return null;
    return one(await this.db.query('SELECT data FROM pw_sites WHERE $1 = ANY(domains) LIMIT 1', [host]));
  }
  async count() { return Number((await this.db.query('SELECT count(*) AS n FROM pw_sites')).rows[0].n); }
  async save(site) {
    const g = site.settings.general;
    await this.db.query(
      `INSERT INTO pw_sites (id, slug, domains, data, updated_at) VALUES ($1, $2, $3, $4, now())
       ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, domains = EXCLUDED.domains, data = EXCLUDED.data, updated_at = now()`,
      [site.id, g.slug, g.domains || [], site],
    );
  }
  async delete(id) { await this.db.query('DELETE FROM pw_sites WHERE id = $1', [id]); }
}

class PgUserRepository {
  constructor(db) { this.db = db; }
  async findAll() { return rows(await this.db.query('SELECT data FROM pw_users ORDER BY username')); }
  async findById(id) { return one(await this.db.query('SELECT data FROM pw_users WHERE id = $1', [id])); }
  async findByUsername(username) { return one(await this.db.query('SELECT data FROM pw_users WHERE username = $1', [username])); }
  async count() { return Number((await this.db.query('SELECT count(*) AS n FROM pw_users')).rows[0].n); }
  async save(user) {
    await this.db.query(
      `INSERT INTO pw_users (id, username, data) VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username, data = EXCLUDED.data`,
      [user.id, user.username, user],
    );
  }
  async delete(id) { await this.db.query('DELETE FROM pw_users WHERE id = $1', [id]); }
}

class PgSubmissionRepository {
  constructor(db) { this.db = db; }
  async findBySite(siteId) { return rows(await this.db.query('SELECT data FROM pw_submissions WHERE site_id = $1 ORDER BY created_at DESC', [siteId])); }
  async findById(id) { return one(await this.db.query('SELECT data FROM pw_submissions WHERE id = $1', [id])); }
  async save(sub) {
    await this.db.query(
      `INSERT INTO pw_submissions (id, site_id, created_at, data) VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
      [sub.id, sub.siteId, sub.createdAt || new Date().toISOString(), sub],
    );
  }
  async delete(id) { await this.db.query('DELETE FROM pw_submissions WHERE id = $1', [id]); }
  async deleteBySite(siteId) { await this.db.query('DELETE FROM pw_submissions WHERE site_id = $1', [siteId]); }
}

module.exports = { PgSiteRepository, PgUserRepository, PgSubmissionRepository };

'use strict';
// Connection pool + schema migration for PostgreSQL (e.g. Neon).
// Every entity is stored as JSONB, with the columns we query on pulled out.
const { Pool } = require('pg');
const crypto = require('crypto');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS pw_meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS pw_sites (
  id         TEXT PRIMARY KEY,
  slug       TEXT NOT NULL UNIQUE,
  domains    TEXT[] NOT NULL DEFAULT '{}',
  data       JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pw_sites_domains ON pw_sites USING GIN (domains);
CREATE TABLE IF NOT EXISTS pw_users (
  id       TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  data     JSONB NOT NULL
);
CREATE TABLE IF NOT EXISTS pw_submissions (
  id         TEXT PRIMARY KEY,
  site_id    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  data       JSONB NOT NULL
);
CREATE INDEX IF NOT EXISTS pw_submissions_site ON pw_submissions (site_id, created_at DESC);
CREATE TABLE IF NOT EXISTS pw_media (
  site_id     TEXT NOT NULL,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL,
  size        INTEGER NOT NULL,
  data        BYTEA NOT NULL,
  modified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (site_id, name)
);
`;

const isLocal = (url) => /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(url);

class PgDatabase {
  constructor(connectionString) {
    // Neon requires TLS. Its URLs carry ?sslmode=require; add TLS ourselves if missing.
    const ssl = /sslmode=/.test(connectionString) || isLocal(connectionString) ? undefined : { rejectUnauthorized: true };
    this.pool = new Pool({ connectionString, ssl, max: 5, idleTimeoutMillis: 30000 });
    this.pool.on('error', (err) => console.error('Postgres pool error:', err.message));
  }

  query(text, params) {
    return this.pool.query(text, params);
  }

  async migrate() {
    await this.query(SCHEMA);
    return this;
  }

  /** Returns a stored secret, creating it on first use. */
  async secret(key = 'session_secret') {
    await this.query('INSERT INTO pw_meta (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [key, crypto.randomBytes(32).toString('hex')]);
    return (await this.query('SELECT value FROM pw_meta WHERE key = $1', [key])).rows[0].value;
  }

  close() {
    return this.pool.end();
  }
}

module.exports = PgDatabase;

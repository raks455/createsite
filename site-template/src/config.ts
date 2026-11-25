import path from 'path';

const env = process.env;

if (!env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Add your Neon (or any PostgreSQL) connection string — see .env.example.');
  process.exit(1);
}

export const config = {
  port: Number(env.PORT) || 3000,
  databaseUrl: env.DATABASE_URL,
  /** Protects /_createsite (content sync from the builder, form entries). Empty = disabled. */
  adminToken: env.ADMIN_TOKEN || '',
  /** Seconds the site content is cached in memory before checking the database for changes. */
  cacheSeconds: Number(env.CACHE_SECONDS ?? 5),
  /** The content this site was exported with; loaded into the database on first start. */
  contentDir: path.join(__dirname, '..', 'content'),
};

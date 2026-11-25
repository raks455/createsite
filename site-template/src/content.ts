// Keeps the site content in memory and reloads it when the database changes
// (e.g. after the CreateSite builder pushes an update).
import type { Site } from './core';
import type { Database } from './db';

export class ContentCache {
  private site: Site | null = null;
  private version: string | null = null;
  private checkedAt = 0;

  constructor(private readonly db: Database, private readonly ttlMs: number) {}

  async get(): Promise<Site> {
    if (this.site && Date.now() - this.checkedAt < this.ttlMs) return this.site;
    this.checkedAt = Date.now();
    const version = await this.db.contentVersion();
    if (!this.site || version !== this.version) {
      const row = await this.db.loadSite();
      if (!row) throw new Error('No site content in the database');
      this.site = row.site;
      this.version = row.version;
    }
    return this.site;
  }

  invalidate(): void {
    this.checkedAt = 0;
    this.version = null;
  }
}

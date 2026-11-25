// Read-only page lookups shared by the builder and every exported site.
import type { Site, Page } from './types';

export const homePage = (site: Site): Page | null =>
  site.pages.find((p) => p.id === site.settings.general?.homePage) || site.pages[0] || null;

export const isHome = (site: Site, page: Page | null | undefined): boolean => !!page && homePage(site)?.id === page.id;

export function findPageByPath(site: Site, path: string): Page | null {
  if (!path) return homePage(site);
  return site.pages.find((p) => p.slug === path) || null;
}

// Maps a public request path to a response: pages, 404, coming-soon mode,
// robots.txt and sitemap.xml. Used by the builder and by exported sites.
import type { Site, Response } from './types';
import { resolveSettings } from './content/siteSettings';
import { renderPage, renderSpecial } from './render/SiteRenderer';
import * as Sites from './site';

export interface ResolveOptions {
  /** Path prefix for internal links, e.g. "/s/my-site" or "" at a domain root. */
  base: string;
  /** True when the request comes from a signed-in editor (sees drafts, skips coming-soon). */
  viewer?: boolean;
  /** "https://example.com", used for absolute URLs in the sitemap. */
  origin?: string;
}

export function resolveRequest(site: Site, rawPath: string, { base, viewer = false, origin = '' }: ResolveOptions): Response {
  const path = String(rawPath || '').replace(/^\/+|\/+$/g, '').toLowerCase();
  const settings = resolveSettings(site.settings);
  const html = (status: number, body: string): Response => ({ status, contentType: 'text/html; charset=utf-8', body });

  if (path === 'robots.txt') {
    const rules = settings.seo.noindex ? 'Disallow: /' : 'Allow: /';
    return { status: 200, contentType: 'text/plain', body: `User-agent: *\n${rules}\nSitemap: ${origin}${base}/sitemap.xml\n` };
  }
  if (path === 'sitemap.xml') {
    const urls = site.pages.filter((p) => p.published && p.slug !== '404')
      .map((p) => `<url><loc>${origin}${base}/${Sites.isHome(site, p) ? '' : p.slug}</loc></url>`).join('');
    return { status: 200, contentType: 'application/xml', body: `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>` };
  }
  if (settings.general.maintenance && !viewer) return html(503, renderSpecial({ site, kind: 'maintenance', base }));

  const page = Sites.findPageByPath(site, path);
  if (!page || (!page.published && !viewer)) return html(404, renderSpecial({ site, kind: '404', base }));
  return html(200, renderPage({ site, page, base, mode: 'live' }));
}

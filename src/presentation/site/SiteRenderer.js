'use strict';
// Implements the SiteRenderer port: site + page -> complete HTML document.
const fs = require('fs');
const path = require('path');
const { SECTION_TYPES } = require('../../domain/content/sectionTypes');
const { resolveSettings } = require('../../domain/content/siteSettings');
const Site = require('../../domain/entities/Site');
const { createHelpers, esc, cssValue, safeCss, safeJs, hasValue } = require('./helpers');
const { RENDERERS } = require('./blocks');
const { themeCss } = require('./theme');
const { fontLinks } = require('./fonts');
const { renderHeader, renderFooter } = require('./layout');
const { SITE_SCRIPT, PREVIEW_SCRIPT, PREVIEW_CSS } = require('./assets/scripts');

const BASE_CSS = fs.readFileSync(path.join(__dirname, 'assets', 'site.css'), 'utf8');

function renderSection(section, u) {
  const def = SECTION_TYPES[section.type];
  const renderer = RENDERERS[section.type];
  if (!def || !renderer) return '';
  const s = { ...(def.defaultStyle || {}), ...(section.style || {}) };
  const id = esc(section.id);
  if (s.hidden) return u.mode === 'preview' ? `<div class="sf-hidden-sec" data-sec="${id}">Hidden section: ${esc(def.label)}</div>` : '';

  const data = { ...def.defaults, ...(section.data || {}) };
  const classes = ['sec', `sec-${section.type}`, `tone-${s.tone || 'default'}`, `w-${s.width || 'default'}`, `a-${s.align || 'left'}`];
  if (s.bgImage) classes.push('has-bgimg');
  if (s.textColor) classes.push('has-text-color');
  if (s.hideMobile) classes.push('hide-m');
  if (s.hideDesktop) classes.push('hide-d');
  if (s.className) classes.push(String(s.className).replace(/[^\w\- ]/g, ''));

  const style = [];
  if (s.bg) style.push(`background-color:${cssValue(s.bg)}`);
  if (s.bgImage) style.push(`background-image:url(${cssValue(s.bgImage)})`, `--ov:${Math.min(Math.max(Number(s.overlay) || 0, 0), 90) / 100}`);
  if (s.textColor) {
    const c = cssValue(s.textColor);
    style.push(`--text:${c}`, `--heading:${c}`, `--muted:color-mix(in srgb,${c} 80%,transparent)`, `color:${c}`);
  }
  if (hasValue(s.paddingTop)) style.push(`padding-top:${Number(s.paddingTop)}px`);
  if (hasValue(s.paddingBottom)) style.push(`padding-bottom:${Number(s.paddingBottom)}px`);
  const extra = renderer.style && renderer.style(data);
  if (extra) style.push(extra);

  let inner;
  try {
    inner = renderer.render(data, u, section);
  } catch (err) {
    inner = u.mode === 'preview' ? `<p style="color:#c00">Error rendering section: ${esc(err.message)}</p>` : '';
  }
  const body = renderer.bare && renderer.bare(data) ? inner : `<div class="container">${inner}</div>`;
  const anchor = s.anchor ? String(s.anchor).replace(/[^\w-]/g, '') : `s-${section.id}`;
  return `<section id="${esc(anchor)}" data-sec="${id}" class="${esc(classes.join(' '))}"${style.length ? ` style="${esc(style.join(';'))}"` : ''}>${body}</section>`;
}

function renderPage({ site, page, base = '', mode = 'live' }) {
  const settings = resolveSettings(site.settings);
  const { general: g, theme: t, header: h, seo, code } = settings;
  const u = createHelpers({ base, mode, site, page, settings });
  const sections = Array.isArray(page.blocks) ? page.blocks : [];

  const title = page.seoTitle || (Site.isHome(site, page) && /^home$/i.test(page.title) ? g.name : String(seo.titleTemplate || '%s').replace(/%s/g, page.title));
  const description = page.seoDescription || seo.description;
  const shareImage = page.seoImage || seo.ogImage;
  const sectionCss = sections.filter((b) => b.style?.css && !b.style.hidden)
    .map((b) => String(b.style.css).replace(/&/g, `[data-sec="${String(b.id).replace(/[^\w-]/g, '')}"]`)).join('\n');

  const animate = t.animations && mode !== 'preview';
  const bodyClasses = [
    h.transparent && !page.hideHeader ? 'has-transparent-header' : '',
    String(page.bodyClass || '').replace(/[^\w\- ]/g, ''),
  ].filter(Boolean).join(' ');

  return `<!doctype html>
<html lang="${esc(g.lang || 'en')}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
${description ? `<meta name="description" content="${esc(description)}">` : ''}
${seo.keywords ? `<meta name="keywords" content="${esc(seo.keywords)}">` : ''}
${seo.noindex || mode === 'preview' ? '<meta name="robots" content="noindex,nofollow">' : ''}
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
${description ? `<meta property="og:description" content="${esc(description)}">` : ''}
${shareImage ? `<meta property="og:image" content="${esc(shareImage)}"><meta name="twitter:card" content="summary_large_image">` : ''}
${seo.favicon ? `<link rel="icon" href="${esc(seo.favicon)}">` : ''}
${fontLinks([t.headingFont, t.bodyFont])}
<style>${BASE_CSS}
${themeCss(settings)}
${mode === 'preview' ? PREVIEW_CSS : ''}
${safeCss(code.customCss)}
${safeCss(page.css)}
${safeCss(sectionCss)}</style>
${code.headCode || ''}
</head>
<body${bodyClasses ? ` class="${esc(bodyClasses)}"` : ''}${animate ? ' data-anim' : ''}>
${page.hideHeader ? '' : renderHeader(settings, u)}
<main id="main">
${sections.map((b) => renderSection(b, u)).join('\n')}
</main>
${page.hideFooter ? '' : renderFooter(settings, u)}
<script>${SITE_SCRIPT}</script>
${mode === 'preview' ? `<script>${PREVIEW_SCRIPT}</script>` : ''}
${code.bodyCode || ''}
${code.customJs ? `<script>${safeJs(code.customJs)}</script>` : ''}
</body>
</html>`;
}

/** Built-in 404 and coming-soon pages (a site page with slug "404" overrides the 404). */
function renderSpecial({ site, kind, base = '', mode = 'live' }) {
  const g = resolveSettings(site.settings).general;
  if (kind === '404') {
    const custom = site.pages.find((p) => p.slug === '404' && p.published);
    if (custom) return renderPage({ site, page: custom, base, mode });
  }
  const notFound = kind === '404';
  const hero = {
    id: `_${kind}`, type: 'hero', style: { align: 'center' },
    data: notFound
      ? { eyebrow: '404', title: 'Page not found', subtitle: "The page you're looking for doesn't exist or has moved.", primaryText: 'Back to home', primaryUrl: '/', secondaryText: '', image: '', layout: 'center', minHeight: 70 }
      : { eyebrow: '', title: g.maintenanceTitle, subtitle: g.maintenanceMessage, primaryText: '', secondaryText: '', image: '', layout: 'center', minHeight: 100 },
  };
  const page = { id: `_${kind}`, title: hero.data.title, blocks: [hero], hideHeader: !notFound, hideFooter: !notFound, seoTitle: '', css: '', bodyClass: '' };
  return renderPage({ site, page, base, mode });
}

module.exports = { renderPage, renderSpecial };

'use strict';
// Site-wide header and footer.
const target = (item) => (item.newTab ? ' target="_blank" rel="noopener"' : '');

function logo(settings, u, { asLink = true } = {}) {
  const h = settings.header;
  const name = h.logoText || settings.general.name;
  const inner = `${h.logo ? `<img src="${u.esc(h.logo)}" alt="${u.esc(name)}">` : ''}${h.logoText ? `<span>${u.esc(h.logoText)}</span>` : ''}` || u.esc(name);
  return asLink ? `<a class="logo" href="${u.url('/')}">${inner}</a>` : `<div class="logo">${inner}</div>`;
}

function renderHeader(settings, u) {
  const h = settings.header;
  const navItems = (Array.isArray(h.nav) ? h.nav : []).map((item) => {
    const a = `<a href="${u.url(item.url)}"${target(item)}>${u.esc(item.label)}${item.children?.length ? ' <span class="caret">▾</span>' : ''}</a>`;
    if (!item.children?.length) return a;
    const sub = item.children.map((c) => `<a href="${u.url(c.url)}"${target(c)}>${u.esc(c.label)}</a>`).join('');
    return `<div class="dd">${a}<div class="dd-menu">${sub}</div></div>`;
  }).join('');
  const cta = h.ctaText ? `<a class="btn hdr-cta" href="${u.url(h.ctaUrl)}">${u.esc(h.ctaText)}</a>` : '';
  const announce = h.announcement
    ? `<div class="announce">${h.announcementUrl ? `<a href="${u.url(h.announcementUrl)}">${u.esc(h.announcement)}</a>` : u.esc(h.announcement)}</div>`
    : '';
  const cls = ['site-header', `hdr-${u.esc(h.layout || 'standard')}`, h.sticky && 'sticky', h.transparent && 'transparent'].filter(Boolean).join(' ');
  return `${announce}<header class="${cls}"><div class="container hdr-inner">${logo(settings, u)}`
    + `<input type="checkbox" id="nav-toggle" class="nav-toggle" aria-label="Toggle menu"><label for="nav-toggle" class="burger" aria-label="Menu"><span></span></label>`
    + `<div class="nav-wrap"><nav class="nav">${navItems}</nav>${cta}</div></div></header>`;
}

function renderFooter(settings, u) {
  const f = settings.footer;
  const copyright = u.esc(f.copyright || '').replace(/\{year\}/g, String(new Date().getFullYear()));
  const social = (Array.isArray(f.social) ? f.social : [])
    .map((s) => `<a class="soc" href="${u.url(s.url)}" target="_blank" rel="noopener">${u.esc(s.label)}</a>`).join('');
  const bottom = `<div class="ftr-bottom"><span>${copyright}</span>${social ? `<div class="socials">${social}</div>` : ''}</div>`;

  if (f.layout === 'simple') return `<footer class="site-footer ftr-simple"><div class="container">${bottom}</div></footer>`;

  const columns = (Array.isArray(f.columns) ? f.columns : []).map((c) =>
    `<div class="ftr-col"><h4>${u.esc(c.title)}</h4>${(c.links || []).map((l) => `<a href="${u.url(l.url)}"${target(l)}>${u.esc(l.label)}</a>`).join('')}</div>`).join('');
  const about = f.showLogo || f.about
    ? `<div class="ftr-about">${f.showLogo ? logo(settings, u) : ''}${f.about ? `<p>${u.nl(f.about)}</p>` : ''}</div>`
    : '';
  const grid = about || columns ? `<div class="ftr-grid">${about}${columns}</div>` : '';
  return `<footer class="site-footer"><div class="container">${grid}${bottom}</div></footer>`;
}

module.exports = { renderHeader, renderFooter };

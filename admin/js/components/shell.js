// App chrome: top bar with breadcrumbs and the site sidebar.
import { h, $ } from '../core/dom.js';
import { state } from '../core/state.js';

export function renderShell(content, crumbs = []) {
  const app = $('#app');
  app.replaceChildren(
    h('header', { class: 'topbar' },
      h('a', { class: 'brand', href: '#/' }, h('span', { class: 'brand-mark' }, '◆'), 'SiteForge'),
      h('nav', { class: 'crumbs' }, crumbs.map((c) => (c.href ? h('a', { href: c.href }, c.label) : h('span', null, c.label)))),
      h('span', { class: 'unsaved' }, '● Unsaved changes'),
      h('div', { class: 'top-actions' },
        h('a', { href: '#/account', class: 'top-link' }, `👤 ${state.me.username}`),
        h('button', { class: 'top-link', onclick: () => window.dispatchEvent(new Event('sf:logout')) }, 'Log out'))),
    h('main', { class: 'main' }, content));
}

export const SITE_TABS = [
  ['pages', '📄', 'Pages'],
  ['theme', '🎨', 'Design'],
  ['header', '☰', 'Header & menu'],
  ['footer', '▁', 'Footer'],
  ['seo', '🔎', 'SEO & sharing'],
  ['code', '⟨/⟩', 'Custom code'],
  ['media', '🖼', 'Media'],
  ['forms', '✉', 'Form entries'],
  ['general', '⚙', 'Site settings'],
];

export const liveUrl = (site) => `/s/${site.settings.general.slug}/`;

export function renderSiteLayout(site, activeTab, content, extraCrumbs = []) {
  const g = site.settings.general;
  const side = h('aside', { class: 'side' },
    h('div', { class: 'side-site' }, h('b', null, g.name), h('a', { href: liveUrl(site), target: '_blank', class: 'muted small' }, `${liveUrl(site)} ↗`)),
    SITE_TABS.map(([key, icon, label]) => h('a', { href: `#/site/${site.id}/${key}`, class: `side-link${key === activeTab ? ' active' : ''}` },
      h('span', { class: 'side-icon' }, icon), label)));
  renderShell(h('div', { class: 'with-side' }, side, h('section', { class: 'side-main' }, content)),
    [{ label: 'Websites', href: '#/' }, { label: g.name, href: `#/site/${site.id}/pages` }, ...extraCrumbs]);
}

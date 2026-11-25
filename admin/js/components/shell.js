// App chrome: top bar with breadcrumbs and the site sidebar.
import { h, $ } from '../core/dom.js';
import { state } from '../core/state.js';
import { icon } from '../core/icons.js';

export const brand = (cls = 'brand') =>
  h('a', { class: cls, href: '#/' }, h('span', { class: 'brand-mark' }, icon('logo', cls.includes('big') ? 20 : 16)), 'CreateSite');

export function renderShell(content, crumbs = []) {
  const app = $('#app');
  const name = state.me?.username || '';
  app.replaceChildren(
    h('header', { class: 'topbar' },
      brand(),
      h('nav', { class: 'crumbs' }, crumbs.map((c) => (c.href ? h('a', { href: c.href }, c.label) : h('span', null, c.label)))),
      h('span', { class: 'unsaved' }, h('span', { class: 'dot' }), 'Unsaved changes'),
      h('div', { class: 'top-actions' },
        h('a', { href: '#/account', class: 'top-link' }, h('span', { class: 'avatar-sm' }, name.slice(0, 1)), name),
        h('button', { class: 'top-link', title: 'Log out', onclick: () => window.dispatchEvent(new Event('sf:logout')) }, icon('logout', 16)))),
    h('main', { class: 'main' }, content));
}

export const SITE_TABS = [
  ['Content'],
  ['pages', 'pages', 'Pages'],
  ['media', 'media', 'Media'],
  ['forms', 'forms', 'Form entries'],
  ['Look & feel'],
  ['theme', 'design', 'Design & motion'],
  ['header', 'header', 'Header & menu'],
  ['footer', 'footer', 'Footer'],
  ['Publish'],
  ['deploy', 'deploy', 'Deploy & code'],
  ['seo', 'seo', 'SEO & sharing'],
  ['code', 'code', 'Custom code'],
  ['general', 'settings', 'Site settings'],
];

export const liveUrl = (site) => `/s/${site.settings.general.slug}/`;

export function renderSiteLayout(site, activeTab, content, extraCrumbs = []) {
  const g = site.settings.general;
  const side = h('aside', { class: 'side' },
    h('div', { class: 'side-site' },
      h('b', null, g.name),
      h('a', { href: liveUrl(site), target: '_blank', class: 'muted small' }, liveUrl(site), icon('external', 12)),
      site.deploy?.url ? h('a', { href: site.deploy.url, target: '_blank', class: 'small' }, h('span', { class: 'pill ok' }, h('span', { class: 'dot' }), 'Deployed'), icon('external', 12)) : null),
    SITE_TABS.map(([key, ico, label]) => (ico
      ? h('a', { href: `#/site/${site.id}/${key}`, class: `side-link${key === activeTab ? ' active' : ''}` }, icon(ico, 17), label)
      : h('div', { class: 'side-group' }, key))));
  renderShell(h('div', { class: 'with-side' }, side, h('section', { class: 'side-main' }, content)),
    [{ label: 'Websites', href: '#/' }, { label: g.name, href: `#/site/${site.id}/pages` }, ...extraCrumbs]);
}

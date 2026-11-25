// Dashboard: list, create, import, duplicate, export and delete websites.
import { h, timeAgo } from '../core/dom.js';
import { get, post, del } from '../core/api.js';
import { state } from '../core/state.js';
import { toast, modal, confirmBox, menu } from '../core/ui.js';
import { icon } from '../core/icons.js';
import { renderShell } from '../components/shell.js';

// Which motion each template uses, shown in the picker.
const MOTION = { portfolio: 'Expressive motion', personal: 'Expressive motion', blank: 'Elegant motion', business: 'Elegant motion', saas: 'Elegant motion', restaurant: 'Elegant motion' };

export async function sitesView() {
  const sites = await get('/api/sites');
  const deployed = sites.filter((s) => s.deployUrl).length;
  const pages = sites.reduce((n, s) => n + s.pageCount, 0);
  const content = h('div', { class: 'page-wrap' },
    h('div', { class: 'dash-hero' },
      h('div', null,
        h('h1', null, `Hi ${state.me.username}, let's build something.`),
        h('p', null, 'Create a site, design it with live preview, then deploy it as its own app.'),
        h('div', { class: 'stats' },
          h('div', null, h('b', null, String(sites.length)), h('span', null, 'websites')),
          h('div', null, h('b', null, String(pages)), h('span', null, 'pages')),
          h('div', null, h('b', null, String(deployed)), h('span', null, 'deployed')))),
      h('div', { class: 'row' },
        h('button', { class: 'btn', onclick: importSite }, icon('upload', 16), 'Import'),
        h('button', { class: 'btn accent', onclick: createSiteDialog }, icon('plus', 16), 'New website'))),
    sites.length
      ? h('div', { class: 'site-grid' }, sites.map(siteCard))
      : h('div', { class: 'empty' }, h('div', { class: 'empty-icon' }, icon('globe', 26)), h('h2', null, 'No websites yet'),
        h('p', { class: 'muted' }, 'Start from a template. Every color, font, section and animation can be changed afterwards.'),
        h('button', { class: 'btn accent', onclick: createSiteDialog }, icon('plus', 16), 'Create a website')));
  renderShell(content, [{ label: 'Websites' }]);
}

function siteCard(s) {
  return h('div', { class: 'site-card' },
    h('a', { class: 'thumb', href: `#/site/${s.id}/pages`, title: 'Edit' },
      h('iframe', { src: s.url, loading: 'lazy', tabindex: '-1', scrolling: 'no', title: s.name }),
      h('div', { class: 'badges' },
        s.deployUrl ? h('span', { class: 'pill ok' }, h('span', { class: 'dot' }), 'Deployed') : null,
        s.maintenance ? h('span', { class: 'pill warn' }, 'Coming soon') : null)),
    h('div', { class: 'site-info' },
      h('h3', null, s.name),
      h('div', { class: 'muted small' }, s.deployUrl || s.domains[0] || s.url),
      h('div', { class: 'muted small' }, `${s.pageCount} page${s.pageCount === 1 ? '' : 's'} · updated ${timeAgo(s.updatedAt)}`)),
    h('div', { class: 'site-actions' },
      h('a', { class: 'btn sm primary', href: `#/site/${s.id}/pages` }, 'Edit'),
      h('a', { class: 'btn sm', href: s.url, target: '_blank' }, 'View', icon('external', 13)),
      menu(icon('more', 16), [
        { label: [icon('deploy', 15), 'Deploy & source code'], href: `#/site/${s.id}/deploy` },
        { label: [icon('code', 15), 'Download source (TypeScript + Postgres)'], href: `/api/sites/${s.id}/export-source.zip`, download: true },
        { label: [icon('download', 15), 'Download static HTML (.zip)'], href: `/api/sites/${s.id}/export.zip`, download: true },
        { label: [icon('download', 15), 'Export site package (.json)'], href: `/api/sites/${s.id}/export.json`, download: true },
        { label: [icon('copy', 15), 'Duplicate'], onClick: async () => { const c = await post(`/api/sites/${s.id}/duplicate`); toast(`Created “${c.settings.general.name}”`); sitesView(); } },
        { label: [icon('trash', 15), 'Delete'], danger: true, onClick: async () => {
          if (!(await confirmBox(`Delete “${s.name}” with all its pages, media and form entries? This cannot be undone.`))) return;
          await del(`/api/sites/${s.id}`); toast('Website deleted'); sitesView();
        } },
      ], { cls: 'btn sm ghost' })));
}

export function createSiteDialog() {
  let template = 'business';
  const name = h('input', { placeholder: 'e.g. Acme Plumbing or Jane Doe', autofocus: true });
  const grid = h('div', { class: 'tpl-grid' });
  const draw = () => grid.replaceChildren(...state.schema.templates.map((t) => h('button', {
    type: 'button', class: `tpl${t.key === template ? ' active' : ''}`, onclick: () => { template = t.key; draw(); },
  }, h('span', { class: 'tpl-icon' }, t.icon), h('b', null, t.label), h('small', null, t.description),
  MOTION[t.key] ? h('span', { class: `pill ${MOTION[t.key].startsWith('Expressive') ? '' : 'gray'}` }, icon('sparkle', 11), MOTION[t.key]) : null)));
  draw();
  const create = async (close) => {
    if (!name.value.trim()) { name.focus(); return; }
    try {
      const site = await post('/api/sites', { name: name.value.trim(), template });
      close();
      toast('Website created');
      location.hash = `#/site/${site.id}/pages`;
    } catch (e) { toast(e.message, 'err'); }
  };
  const m = modal('Create a new website', h('form', { class: 'stack', onsubmit: (e) => { e.preventDefault(); create(m.close); } },
    h('label', { class: 'lbl' }, 'Website name'), name,
    h('label', { class: 'lbl' }, 'Start from a template'), grid,
    h('p', { class: 'help' }, 'Portfolio and personal templates use expressive motion. Professional templates use elegant motion. You can switch styles anytime under Design & motion.')), {
    wide: true,
    actions: [{ label: 'Cancel', onClick: (c) => c() }, { label: 'Create website', class: 'primary', onClick: create }],
  });
  setTimeout(() => name.focus(), 30);
}

function importSite() {
  const input = h('input', { type: 'file', accept: '.json,application/json' });
  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;
    try {
      const pkg = JSON.parse(await file.text());
      const site = await post('/api/sites/import', { package: pkg });
      toast(`Imported “${site.settings.general.name}”`);
      location.hash = `#/site/${site.id}/pages`;
    } catch (e) { toast(`Import failed: ${e.message}`, 'err'); }
  };
  input.click();
}

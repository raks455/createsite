// Dashboard: list, create, import, duplicate, export and delete websites.
import { h, timeAgo } from '../core/dom.js';
import { get, post, del } from '../core/api.js';
import { state } from '../core/state.js';
import { toast, modal, confirmBox, menu } from '../core/ui.js';
import { renderShell } from '../components/shell.js';

export async function sitesView() {
  const sites = await get('/api/sites');
  const content = h('div', { class: 'page-wrap' },
    h('div', { class: 'page-head' },
      h('div', null, h('h1', null, 'Your websites'), h('p', { class: 'muted' }, `${sites.length} website${sites.length === 1 ? '' : 's'}`)),
      h('div', { class: 'row' },
        h('button', { class: 'btn', onclick: importSite }, '⬆ Import site'),
        h('button', { class: 'btn primary', onclick: createSiteDialog }, '+ New website'))),
    sites.length
      ? h('div', { class: 'site-grid' }, sites.map(siteCard))
      : h('div', { class: 'empty' }, h('div', { class: 'empty-icon' }, '🌐'), h('h2', null, 'No websites yet'),
        h('p', { class: 'muted' }, 'Create your first website from a template — everything is customizable afterwards.'),
        h('button', { class: 'btn primary', onclick: createSiteDialog }, '+ Create a website')));
  renderShell(content, [{ label: 'Websites' }]);
}

function siteCard(s) {
  return h('div', { class: 'site-card' },
    h('a', { class: 'thumb', href: `#/site/${s.id}/pages`, title: 'Edit' },
      h('iframe', { src: s.url, loading: 'lazy', tabindex: '-1', scrolling: 'no', title: s.name }),
      s.maintenance ? h('span', { class: 'pill warn' }, 'Coming-soon mode') : null),
    h('div', { class: 'site-info' },
      h('h3', null, s.name),
      h('div', { class: 'muted small' }, s.domains[0] || s.url),
      h('div', { class: 'muted small' }, `${s.pageCount} page${s.pageCount === 1 ? '' : 's'} · updated ${timeAgo(s.updatedAt)}`)),
    h('div', { class: 'site-actions' },
      h('a', { class: 'btn sm primary', href: `#/site/${s.id}/pages` }, 'Edit'),
      h('a', { class: 'btn sm', href: s.url, target: '_blank' }, 'View ↗'),
      menu('•••', [
        { label: '⧉ Duplicate', onClick: async () => { const c = await post(`/api/sites/${s.id}/duplicate`); toast(`Created “${c.settings.general.name}”`); sitesView(); } },
        { label: '⬇ Export site package (.json)', href: `/api/sites/${s.id}/export.json`, download: true },
        { label: '⬇ Download static HTML (.zip)', href: `/api/sites/${s.id}/export.zip`, download: true },
        { label: '🗑 Delete', danger: true, onClick: async () => {
          if (!(await confirmBox(`Delete “${s.name}” with all its pages, media and form entries? This cannot be undone.`))) return;
          await del(`/api/sites/${s.id}`); toast('Website deleted'); sitesView();
        } },
      ])));
}

export function createSiteDialog() {
  let template = 'business';
  const name = h('input', { placeholder: 'e.g. Acme Plumbing', autofocus: true });
  const grid = h('div', { class: 'tpl-grid' });
  const draw = () => grid.replaceChildren(...state.schema.templates.map((t) => h('button', {
    type: 'button', class: `tpl${t.key === template ? ' active' : ''}`, onclick: () => { template = t.key; draw(); },
  }, h('span', { class: 'tpl-icon' }, t.icon), h('b', null, t.label), h('small', null, t.description))));
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
    h('label', { class: 'lbl' }, 'Start from a template'), grid), {
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

// Form entries submitted by visitors, with CSV export.
import { h } from '../core/dom.js';
import { get, del } from '../core/api.js';
import { toast, confirmBox } from '../core/ui.js';
import { renderSiteLayout } from '../components/shell.js';
import { icon } from '../core/icons.js';

function toCsv(entries, columns) {
  const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [['date', 'page', ...columns].map(cell).join(','),
    ...entries.map((e) => [e.createdAt, e.pageTitle, ...columns.map((c) => e.data[c])].map(cell).join(','))].join('\r\n');
}

export async function formsTab(site, reload) {
  const entries = await get(`/api/sites/${site.id}/submissions`);
  const pageTitle = (id) => site.pages.find((p) => p.id === id)?.title || '—';
  entries.forEach((e) => { e.pageTitle = pageTitle(e.pageId); });
  const columns = [...new Set(entries.flatMap((e) => Object.keys(e.data)))];

  const download = () => {
    const blob = new Blob([toCsv(entries, columns)], { type: 'text/csv' });
    const a = h('a', { href: URL.createObjectURL(blob), download: `${site.settings.general.slug}-form-entries.csv` });
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const table = entries.length
    ? h('div', { class: 'table-wrap' }, h('table', { class: 'table' },
      h('thead', null, h('tr', null, h('th', null, 'Date'), h('th', null, 'Page'), columns.map((c) => h('th', null, c)), h('th'))),
      h('tbody', null, entries.map((e) => h('tr', null,
        h('td', { class: 'nowrap' }, new Date(e.createdAt).toLocaleString()),
        h('td', null, e.pageTitle),
        columns.map((c) => h('td', { class: 'cell' }, e.data[c] ?? '')),
        h('td', null, h('button', { class: 'btn xs danger-ghost', onclick: async () => {
          if (!(await confirmBox('Delete this entry?'))) return;
          await del(`/api/sites/${site.id}/submissions/${e.id}`); toast('Entry deleted'); reload();
        } }, 'Delete')))))))
    : h('div', { class: 'empty' }, h('div', { class: 'empty-icon' }, '✉'), h('h2', null, 'No entries yet'),
      h('p', { class: 'muted' }, 'Add a “Contact & form” section to a page. Everything visitors send appears here.'));

  renderSiteLayout(site, 'forms', h('div', { class: 'page-wrap' },
    h('div', { class: 'page-head' },
      h('div', null, h('h1', null, 'Form entries'), h('p', { class: 'muted' }, `${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}`)),
      entries.length ? h('div', { class: 'row' },
        h('button', { class: 'btn', onclick: download }, icon('download', 15), 'Export CSV'),
        h('button', { class: 'btn danger-ghost', onclick: async () => {
          if (!(await confirmBox('Delete all form entries for this website?'))) return;
          await del(`/api/sites/${site.id}/submissions`); toast('All entries deleted'); reload();
        } }, 'Delete all')) : null),
    table));
}

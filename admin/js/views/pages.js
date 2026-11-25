// Pages tab: list, create, reorder, set home, duplicate, delete.
import { h } from '../core/dom.js';
import { post, put, del } from '../core/api.js';
import { toast, confirmBox, promptForm, menu, sortable } from '../core/ui.js';
import { renderSiteLayout, liveUrl } from '../components/shell.js';

export function pagesTab(site, reload) {
  const homeId = site.settings.general.homePage || site.pages[0]?.id;
  const base = liveUrl(site);
  const list = h('div', { class: 'page-list' }, site.pages.map((p) => {
    const isHome = p.id === homeId;
    const url = isHome ? base : `${base}${p.slug}`;
    return h('div', { class: 'page-row', 'data-sort': p.id },
      h('span', { class: 'handle', title: 'Drag to reorder' }, '⋮⋮'),
      h('a', { class: 'pr-main', href: `#/site/${site.id}/page/${p.id}` },
        h('b', null, p.title),
        h('span', { class: 'muted small' }, isHome ? '/  (home page)' : `/${p.slug}`)),
      h('div', { class: 'row' },
        isHome ? h('span', { class: 'pill' }, '🏠 Home') : null,
        p.published ? null : h('span', { class: 'pill warn' }, 'Draft'),
        h('span', { class: 'muted small' }, `${p.blocks.length} sections`)),
      h('div', { class: 'row' },
        h('a', { class: 'btn sm primary', href: `#/site/${site.id}/page/${p.id}` }, 'Edit'),
        h('a', { class: 'btn sm', href: url, target: '_blank' }, 'View ↗'),
        menu('•••', [
          !isHome && { label: '🏠 Set as home page', onClick: async () => { await post(`/api/sites/${site.id}/pages/${p.id}/home`); toast('Home page updated'); reload(); } },
          { label: '⧉ Duplicate', onClick: async () => { await post(`/api/sites/${site.id}/pages/${p.id}/duplicate`); toast('Page duplicated'); reload(); } },
          { label: '🗑 Delete', danger: true, onClick: async () => {
            if (!(await confirmBox(`Delete the page “${p.title}”?`))) return;
            try { await del(`/api/sites/${site.id}/pages/${p.id}`); toast('Page deleted'); reload(); } catch (e) { toast(e.message, 'err'); }
          } },
        ])));
  }));

  sortable(list, async (ids) => {
    await put(`/api/sites/${site.id}/pages-order`, { ids });
    toast('Page order saved');
  });

  const addPage = async () => {
    const v = await promptForm('New page', [
      { key: 'title', label: 'Page title', placeholder: 'e.g. About us', required: true },
      { key: 'slug', label: 'URL path (optional)', placeholder: 'about-us', help: 'Generated from the title if empty.' },
    ], { submitLabel: 'Create page' });
    if (!v) return;
    try {
      const page = await post(`/api/sites/${site.id}/pages`, v);
      location.hash = `#/site/${site.id}/page/${page.id}`;
    } catch (e) { toast(e.message, 'err'); }
  };

  renderSiteLayout(site, 'pages', h('div', { class: 'page-wrap' },
    h('div', { class: 'page-head' },
      h('div', null, h('h1', null, 'Pages'), h('p', { class: 'muted' }, 'Drag to reorder. Add pages to the menu under “Header & menu”.')),
      h('button', { class: 'btn primary', onclick: addPage }, '+ New page')),
    list));
}

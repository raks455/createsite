// Visual page editor: section list + schema-driven fields on the left,
// live preview on the right.
import { h, uid, stripHtml } from '../core/dom.js';
import { get, put } from '../core/api.js';
import { state, setDirty, bindSaveShortcut } from '../core/state.js';
import { toast, modal, confirmBox, iconBtn, sortable } from '../core/ui.js';
import { buildFields, updateLinkSuggestions } from '../fields/index.js';
import { createPreview } from '../components/preview.js';
import { renderShell, liveUrl } from '../components/shell.js';
import { icon } from '../core/icons.js';

export async function pageEditorView(siteId, pageId) {
  const site = await get(`/api/sites/${siteId}`);
  const stored = site.pages.find((p) => p.id === pageId);
  if (!stored) { location.hash = `#/site/${siteId}/pages`; return; }

  const page = structuredClone(stored);
  const { sections: SECTIONS, sectionStyleFields, pageFields } = state.schema;
  let openId = null;
  let tab = 'sections';
  const sectionTab = {};

  const changed = () => { setDirty(true); preview.refresh(); };
  const ctx = { site, onChange: changed };
  updateLinkSuggestions(site, page.blocks.filter((b) => b.style?.anchor).map((b) => `#${b.style.anchor}`));

  const isHome = () => (site.settings.general.homePage || site.pages[0]?.id) === page.id;
  const preview = createPreview(siteId, () => ({ page }), {
    onSelect: (id) => { openId = id; tab = 'sections'; draw(); scrollCardIntoView(id); preview.select(id, false); },
    liveUrl: () => liveUrl(site) + (isHome() ? '' : page.slug),
  });

  const save = async () => {
    try {
      const saved = await put(`/api/sites/${siteId}/pages/${pageId}`, page);
      Object.assign(page, saved);
      setDirty(false);
      titleEl.textContent = page.title;
      toast('Page saved');
    } catch (e) { toast(e.message, 'err'); }
  };
  bindSaveShortcut(save);

  // --- Section operations -------------------------------------------------
  const newSection = (type) => {
    const def = SECTIONS[type];
    return { id: uid(), type, data: structuredClone(def.defaults), style: structuredClone(def.defaultStyle || {}) };
  };
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= page.blocks.length) return;
    [page.blocks[i], page.blocks[j]] = [page.blocks[j], page.blocks[i]];
    changed(); draw();
  };
  const duplicate = (i) => {
    const copy = structuredClone(page.blocks[i]);
    copy.id = uid();
    page.blocks.splice(i + 1, 0, copy);
    openId = copy.id; changed(); draw(); preview.select(copy.id);
  };
  const remove = async (i) => {
    const def = SECTIONS[page.blocks[i].type];
    if (!(await confirmBox(`Remove this “${def?.label || page.blocks[i].type}” section?`, { confirmLabel: 'Remove' }))) return;
    page.blocks.splice(i, 1); changed(); draw();
  };
  const addSection = (index) => {
    const byCategory = {};
    Object.values(SECTIONS).forEach((d) => (byCategory[d.category] ||= []).push(d));
    const m = modal('Add a section', h('div', null, Object.entries(byCategory).map(([cat, defs]) => [
      h('h4', { class: 'cat' }, cat),
      h('div', { class: 'picker' }, defs.map((d) => h('button', { class: 'pick', type: 'button', onclick: () => {
        const s = newSection(d.type);
        page.blocks.splice(index, 0, s);
        openId = s.id; m.close(); changed(); draw(); preview.select(s.id);
        setTimeout(() => scrollCardIntoView(s.id), 50);
      } }, h('span', { class: 'pick-icon' }, d.icon), h('b', null, d.label), h('small', null, d.description)))),
    ])), { wide: true });
  };

  // --- Rendering ------------------------------------------------------------
  const summary = (b) => {
    const d = b.data || {};
    const text = d.title || d.eyebrow || stripHtml(d.content || d.html || '').trim();
    return String(text || '').slice(0, 50);
  };

  function sectionCard(b, i) {
    const def = SECTIONS[b.type] || { label: b.type, icon: '?', fields: [] };
    const isOpen = openId === b.id;
    const hidden = !!b.style?.hidden;
    const head = h('div', { class: 'blk-head', onclick: (e) => {
      if (e.target.closest('button,.handle')) return;
      openId = isOpen ? null : b.id;
      draw();
      preview.select(openId);
    } },
    h('span', { class: 'handle', title: 'Drag to reorder' }, '⋮⋮'),
    h('span', { class: 'blk-icon' }, def.icon),
    h('div', { class: 'blk-title' }, h('b', null, def.label), h('span', { class: 'muted small' }, summary(b))),
    h('div', { class: 'blk-actions' },
      iconBtn('↑', 'Move up', () => move(i, -1)),
      iconBtn('↓', 'Move down', () => move(i, 1)),
      iconBtn('＋', 'Add section below', () => addSection(i + 1)),
      iconBtn(icon('copy', 14), 'Duplicate', () => duplicate(i)),
      iconBtn(hidden ? '◌' : '◉', hidden ? 'Show section' : 'Hide section', () => { b.style = b.style || {}; b.style.hidden = !hidden; changed(); draw(); }),
      iconBtn(icon('trash', 14), 'Delete', () => remove(i), 'danger')));

    const card = h('div', { class: `blk${isOpen ? ' open' : ''}${hidden ? ' is-hidden' : ''}`, 'data-sort': b.id }, head);
    if (isOpen) {
      const sub = sectionTab[b.id] || 'content';
      b.style = b.style || {};
      card.append(h('div', { class: 'blk-body' },
        h('div', { class: 'subtabs' }, [['content', 'Content'], ['style', 'Style & layout']].map(([k, label]) =>
          h('button', { type: 'button', class: sub === k ? 'active' : '', onclick: () => { sectionTab[b.id] = k; draw(); } }, label))),
        sub === 'content' ? buildFields(def.fields, b.data, ctx) : buildFields(sectionStyleFields, b.style, ctx)));
    }
    return card;
  }

  const scrollCardIntoView = (id) => left.querySelector(`[data-sort="${CSS.escape(id)}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

  const left = h('div', { class: 'ed-scroll' });
  function draw() {
    tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === tab));
    if (tab === 'settings') {
      left.replaceChildren(h('div', { class: 'pad' }, buildFields(pageFields, page, { ...ctx, onChange: () => { titleEl.textContent = page.title; changed(); } })));
      return;
    }
    const list = h('div', { class: 'blocks' }, page.blocks.map(sectionCard));
    sortable(list, (order) => {
      page.blocks.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
      changed(); draw();
    });
    left.replaceChildren(h('div', { class: 'pad' },
      page.blocks.length ? list : h('p', { class: 'muted empty-small' }, 'This page is empty. Add your first section.'),
      h('button', { class: 'btn add-sec', type: 'button', onclick: () => addSection(page.blocks.length) }, '+ Add section')));
  }

  const titleEl = h('span', null, page.title);
  const tabs = [['sections', 'Sections'], ['settings', 'Page settings']].map(([k, label]) =>
    h('button', { type: 'button', 'data-tab': k, onclick: () => { tab = k; draw(); } }, label));

  const leftPane = h('div', { class: 'ed-left' },
    h('div', { class: 'ed-head' },
      h('div', { class: 'ed-title' }, h('small', { class: 'muted' }, 'Editing page'), h('b', null, titleEl)),
      h('button', { class: 'btn primary save-btn', onclick: save, title: 'Ctrl+S' }, 'Save')),
    h('div', { class: 'ed-tabs' }, tabs),
    left);

  renderShell(h('div', { class: 'editor full' }, leftPane, preview.el), [
    { label: 'Websites', href: '#/' },
    { label: site.settings.general.name, href: `#/site/${siteId}/pages` },
    { label: page.title },
  ]);
  draw();
}

// Site-wide settings tabs (design, header, footer, SEO, code, general),
// each a schema-generated form with a live preview of the home page.
import { h } from '../core/dom.js';
import { put, post, del } from '../core/api.js';
import { state, setDirty, bindSaveShortcut } from '../core/state.js';
import { toast, confirmBox } from '../core/ui.js';
import { buildFields, updateLinkSuggestions } from '../fields/index.js';
import { createPreview } from '../components/preview.js';
import { renderSiteLayout, liveUrl } from '../components/shell.js';

export function settingsTab(site, group, reload) {
  const def = state.schema.siteSettings[group];
  const draft = structuredClone(site.settings);
  draft[group] = draft[group] || {};
  updateLinkSuggestions(site);

  const preview = createPreview(site.id, () => ({ settings: draft, pageId: draft.general.homePage }), { liveUrl: () => liveUrl(site) });
  const ctx = { site, onChange: () => { setDirty(true); preview.refresh(); } };

  const save = async () => {
    try {
      const saved = await put(`/api/sites/${site.id}`, { settings: { [group]: draft[group] } });
      setDirty(false);
      toast('Saved');
      if (group === 'general') { Object.assign(site, saved); reload(); }
    } catch (e) { toast(e.message, 'err'); }
  };
  bindSaveShortcut(save);

  const extras = group === 'general' ? dangerZone(site) : null;

  renderSiteLayout(site, group, h('div', { class: 'editor' },
    h('div', { class: 'ed-left' },
      h('div', { class: 'ed-head' },
        h('div', { class: 'ed-title' }, h('b', null, def.label), h('small', { class: 'muted' }, def.description)),
        h('button', { class: 'btn primary save-btn', onclick: save, title: 'Ctrl+S' }, 'Save')),
      h('div', { class: 'ed-scroll' }, h('div', { class: 'pad' }, buildFields(def.fields, draft[group], ctx), extras))),
    preview.el));
}

function dangerZone(site) {
  return h('div', { class: 'zone' },
    h('h4', null, 'Export & copies'),
    h('div', { class: 'row wrap' },
      h('a', { class: 'btn sm', href: `/api/sites/${site.id}/export.json`, download: '' }, '⬇ Site package (.json)'),
      h('a', { class: 'btn sm', href: `/api/sites/${site.id}/export.zip`, download: '' }, '⬇ Static HTML (.zip)'),
      h('button', { class: 'btn sm', onclick: async () => {
        const copy = await post(`/api/sites/${site.id}/duplicate`);
        toast('Website duplicated');
        location.hash = `#/site/${copy.id}/pages`;
      } }, '⧉ Duplicate website')),
    h('p', { class: 'help' }, 'The site package can be imported into any CreateSite install. The ZIP can be uploaded to any static host (Netlify, cPanel, S3…). For the full TypeScript + PostgreSQL source code, open Deploy & code.'),
    h('h4', { class: 'danger-title' }, 'Danger zone'),
    h('button', { class: 'btn sm danger', onclick: async () => {
      if (!(await confirmBox(`Delete “${site.settings.general.name}” with all pages, media and form entries? This cannot be undone.`))) return;
      await del(`/api/sites/${site.id}`);
      setDirty(false);
      toast('Website deleted');
      location.hash = '#/';
    } }, '🗑 Delete this website'));
}

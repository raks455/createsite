import { h } from '../core/dom.js';
import { uploadZone, mediaGrid } from '../components/mediaLibrary.js';
import { renderSiteLayout } from '../components/shell.js';

export function mediaTab(site) {
  const grid = mediaGrid(site.id, { manage: true });
  renderSiteLayout(site, 'media', h('div', { class: 'page-wrap' },
    h('div', { class: 'page-head' }, h('div', null, h('h1', null, 'Media'), h('p', { class: 'muted' }, 'Images and files used by this website.'))),
    uploadZone(site.id, () => grid.reload()),
    grid.el));
}

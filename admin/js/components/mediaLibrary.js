// Media library: upload zone, file grid and a picker modal.
import { h, formatBytes } from '../core/dom.js';
import { get, api, del } from '../core/api.js';
import { toast, modal, confirmBox } from '../core/ui.js';

const isImage = (f) => f.type.startsWith('image/');

export function uploadZone(siteId, onUploaded) {
  const input = h('input', { type: 'file', multiple: true, hidden: true, onchange: () => upload(input.files) });
  const zone = h('div', {
    class: 'drop', tabindex: '0',
    onclick: () => input.click(),
    onkeydown: (e) => { if (e.key === 'Enter') input.click(); },
    ondragover: (e) => { e.preventDefault(); zone.classList.add('over'); },
    ondragleave: () => zone.classList.remove('over'),
    ondrop: (e) => { e.preventDefault(); zone.classList.remove('over'); upload(e.dataTransfer.files); },
  }, h('b', null, 'Drop files here or click to upload'), h('small', null, 'Images, video, PDF, fonts — up to 50 MB each'));

  async function upload(files) {
    if (!files || !files.length) return;
    const fd = new FormData();
    [...files].forEach((f) => fd.append('files', f));
    zone.classList.add('busy');
    try {
      const res = await api('POST', `/api/sites/${siteId}/media`, fd);
      if (res.rejected.length) toast(`Not allowed: ${res.rejected.join(', ')}`, 'err');
      if (res.files.length) toast(`Uploaded ${res.files.length} file(s)`);
      onUploaded(res.files);
    } catch (e) { toast(e.message, 'err'); }
    zone.classList.remove('busy');
    input.value = '';
  }
  return h('div', null, zone, input);
}

function thumb(file) {
  if (isImage(file)) return h('img', { src: file.url, alt: file.name, loading: 'lazy' });
  return h('div', { class: 'file-icon' }, file.type.startsWith('video/') ? '🎬' : '📄', h('small', null, file.name.split('.').pop()));
}

/** Grid of media files. onSelect(file) for picking; manage=true shows copy/delete. */
export function mediaGrid(siteId, { onSelect, manage = false } = {}) {
  const grid = h('div', { class: 'media-grid' });
  async function load() {
    const files = await get(`/api/sites/${siteId}/media`);
    if (!files.length) return grid.replaceChildren(h('p', { class: 'muted empty-small' }, 'No files yet — upload some above.'));
    grid.replaceChildren(...files.map((f) => h('div', { class: 'media-item' },
      h('button', { class: 'media-thumb', type: 'button', title: f.name, onclick: () => onSelect ? onSelect(f) : window.open(f.url, '_blank') }, thumb(f)),
      h('div', { class: 'media-meta' }, h('span', { class: 'media-name', title: f.name }, f.name), h('small', { class: 'muted' }, formatBytes(f.size))),
      manage ? h('div', { class: 'row' },
        h('button', { class: 'btn xs', onclick: async () => { await navigator.clipboard.writeText(location.origin + f.url); toast('URL copied'); } }, 'Copy URL'),
        h('button', { class: 'btn xs danger-ghost', onclick: async () => {
          if (!(await confirmBox(`Delete ${f.name}? Pages using it will show a broken image.`))) return;
          await del(`/api/sites/${siteId}/media/${encodeURIComponent(f.name)}`);
          toast('File deleted'); load();
        } }, 'Delete')) : null)));
  }
  load().catch((e) => toast(e.message, 'err'));
  return { el: grid, reload: load };
}

export function openMediaPicker(siteId, onPick) {
  let m;
  const grid = mediaGrid(siteId, { onSelect: (f) => { onPick(f.url); m.close(); } });
  const urlInput = h('input', { type: 'text', placeholder: 'https://… paste an external image URL' });
  const body = h('div', { class: 'stack' },
    uploadZone(siteId, (files) => { if (files.length === 1 && isImage(files[0])) { onPick(files[0].url); m.close(); } else grid.reload(); }),
    h('div', { class: 'row' }, urlInput, h('button', { class: 'btn', onclick: () => { if (urlInput.value.trim()) { onPick(urlInput.value.trim()); m.close(); } } }, 'Use URL')),
    grid.el);
  m = modal('Media library', body, { wide: true });
}

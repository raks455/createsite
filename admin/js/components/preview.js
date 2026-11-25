// Live preview pane: renders drafts server-side into an iframe, with device
// sizes, scroll preservation and click-to-select sections.
import { h } from '../core/dom.js';
import { api } from '../core/api.js';
import { onLeave } from '../core/state.js';
import { icon } from '../core/icons.js';

export function createPreview(siteId, getBody, { onSelect, liveUrl } = {}) {
  const frame = h('iframe', { class: 'pv-frame', title: 'Preview' });
  const stage = h('div', { class: 'pv-device', 'data-dev': 'desktop' }, frame);
  const status = h('span', { class: 'pv-status' });
  let timer = null, scrollY = 0, selected = null, scrollPending = false, seq = 0;

  const devices = [['desktop', icon('desktop', 16), 'Desktop'], ['tablet', icon('tablet', 16), 'Tablet'], ['mobile', icon('mobile', 16), 'Mobile']];
  const devButtons = devices.map(([dev, icon, label]) => h('button', {
    class: `dev${dev === 'desktop' ? ' active' : ''}`, title: label, type: 'button',
    onclick: (e) => { stage.dataset.dev = dev; devButtons.forEach((b) => b.classList.toggle('active', b === e.currentTarget)); },
  }, icon));

  async function load() {
    const mine = ++seq;
    try { scrollY = frame.contentWindow?.scrollY ?? scrollY; } catch {}
    status.textContent = 'Updating…';
    try {
      const html = await api('POST', `/api/sites/${siteId}/preview`, getBody());
      if (mine !== seq) return; // a newer render is on its way
      frame.srcdoc = html;
      status.textContent = '';
    } catch (e) { status.textContent = `Preview error: ${e.message}`; }
  }

  function applySelection() {
    try {
      const doc = frame.contentDocument;
      doc.querySelectorAll('.sf-hl').forEach((el) => el.classList.remove('sf-hl'));
      const el = selected && doc.querySelector(`[data-sec="${CSS.escape(selected)}"]`);
      if (!el) return;
      el.classList.add('sf-hl');
      if (scrollPending) { el.scrollIntoView({ block: 'start' }); scrollPending = false; }
    } catch {}
  }

  frame.addEventListener('load', () => {
    try { frame.contentWindow.scrollTo(0, scrollY); } catch {}
    applySelection();
  });

  const onMessage = (e) => {
    if (e.source === frame.contentWindow && e.data?.type === 'sf-select' && onSelect) onSelect(e.data.id);
  };
  window.addEventListener('message', onMessage);
  onLeave(() => { window.removeEventListener('message', onMessage); clearTimeout(timer); });

  load();

  return {
    el: h('div', { class: 'ed-right' },
      h('div', { class: 'pv-bar' }, h('div', { class: 'row' }, devButtons), status,
        h('div', { class: 'row' },
          h('button', { class: 'dev', title: 'Refresh', type: 'button', onclick: () => load() }, icon('refresh', 15)),
          liveUrl ? h('a', { class: 'dev', title: 'Open live page', href: liveUrl(), target: '_blank' }, icon('external', 15)) : null)),
      h('div', { class: 'pv-stage' }, stage)),
    refresh(now = false) { clearTimeout(timer); timer = setTimeout(load, now ? 0 : 350); },
    select(id, scroll = true) { selected = id; scrollPending = scroll; applySelection(); },
  };
}

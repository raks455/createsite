// Reusable UI primitives: toasts, modals, menus, drag-sorting, buttons.
import { h } from './dom.js';

export function toast(message, type = 'ok') {
  const el = h('div', { class: `toast ${type}` }, message);
  document.body.append(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, type === 'err' ? 4500 : 2600);
}

export function modal(title, body, { wide = false, actions = [] } = {}) {
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  const close = () => { overlay.remove(); document.removeEventListener('keydown', onKey); };
  const overlay = h('div', { class: 'modal-ov', onmousedown: (e) => { if (e.target === overlay) close(); } },
    h('div', { class: `modal${wide ? ' wide' : ''}`, role: 'dialog' },
      h('div', { class: 'modal-head' }, h('h3', null, title), h('button', { class: 'icon-btn', title: 'Close', onclick: close }, '✕')),
      h('div', { class: 'modal-body' }, body),
      actions.length ? h('div', { class: 'modal-foot' }, actions.map((a) =>
        h('button', { class: `btn ${a.class || ''}`, onclick: () => a.onClick(close) }, a.label))) : null));
  document.body.append(overlay);
  document.addEventListener('keydown', onKey);
  return { close, el: overlay };
}

export function confirmBox(message, { confirmLabel = 'Delete', danger = true } = {}) {
  return new Promise((resolve) => {
    modal('Are you sure?', h('p', null, message), {
      actions: [
        { label: 'Cancel', onClick: (c) => { c(); resolve(false); } },
        { label: confirmLabel, class: danger ? 'danger' : 'primary', onClick: (c) => { c(); resolve(true); } },
      ],
    });
  });
}

/** Simple form dialog. fields: [{key,label,value,placeholder,type}] → resolves with values or null. */
export function promptForm(title, fields, { submitLabel = 'Save' } = {}) {
  return new Promise((resolve) => {
    const inputs = {};
    const form = h('form', { class: 'stack', onsubmit: (e) => { e.preventDefault(); submit(); } },
      fields.map((f) => {
        inputs[f.key] = h('input', { type: f.type || 'text', value: f.value || '', placeholder: f.placeholder || '', required: f.required });
        return h('label', { class: 'fld' }, h('span', { class: 'lbl' }, f.label), inputs[f.key], f.help ? h('small', { class: 'help' }, f.help) : null);
      }),
      h('button', { type: 'submit', hidden: true }));
    let m;
    const submit = () => {
      const values = Object.fromEntries(Object.entries(inputs).map(([k, el]) => [k, el.value.trim()]));
      if (fields.some((f) => f.required && !values[f.key])) return;
      m.close(); resolve(values);
    };
    m = modal(title, form, { actions: [{ label: 'Cancel', onClick: (c) => { c(); resolve(null); } }, { label: submitLabel, class: 'primary', onClick: submit }] });
    setTimeout(() => form.querySelector('input')?.focus(), 30);
  });
}

/** Dropdown menu button. items: [{label, onClick?, href?, download?, danger?}] */
export function menu(label, items, { cls = 'btn sm' } = {}) {
  const wrap = h('div', { class: 'menu' });
  const close = () => { wrap.classList.remove('open'); document.removeEventListener('click', close); };
  const button = h('button', { class: cls, type: 'button', onclick: (e) => {
    e.stopPropagation();
    if (wrap.classList.toggle('open')) setTimeout(() => document.addEventListener('click', close));
  } }, label);
  wrap.append(button, h('div', { class: 'menu-pop' }, items.filter(Boolean).map((it) => it.href
    ? h('a', { href: it.href, class: it.danger ? 'danger' : '', download: it.download ? '' : null, target: it.target || null }, it.label)
    : h('button', { type: 'button', class: it.danger ? 'danger' : '', onclick: it.onClick }, it.label))));
  return wrap;
}

export const iconBtn = (icon, title, onClick, cls = '') =>
  h('button', { class: `icon-btn ${cls}`, type: 'button', title, 'aria-label': title, onclick: (e) => { e.stopPropagation(); onClick(e); } }, icon);

/**
 * Drag-and-drop sorting by a ".handle" inside children marked [data-sort].
 * Nested sortables are supported. onSort receives the new order of keys.
 */
export function sortable(container, onSort) {
  let dragging = null;
  const own = (el) => el && el.parentElement === container;
  container.addEventListener('mousedown', (e) => {
    const handle = e.target.closest('.handle');
    const item = handle && handle.closest('[data-sort]');
    if (own(item)) item.draggable = true;
  });
  container.addEventListener('dragstart', (e) => {
    const item = e.target.closest('[data-sort]');
    if (!own(item) || !item.draggable) return;
    e.stopPropagation();
    dragging = item;
    item.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  });
  container.addEventListener('dragover', (e) => {
    if (!dragging) return;
    e.preventDefault();
    e.stopPropagation();
    const over = e.target.closest('[data-sort]');
    let target = over;
    while (target && !own(target)) target = target.parentElement?.closest('[data-sort]');
    if (!target || target === dragging) return;
    const r = target.getBoundingClientRect();
    container.insertBefore(dragging, e.clientY > r.top + r.height / 2 ? target.nextSibling : target);
  });
  container.addEventListener('dragend', (e) => {
    if (!dragging) return;
    e.stopPropagation();
    dragging.classList.remove('dragging');
    dragging.draggable = false;
    dragging = null;
    onSort([...container.children].filter((c) => c.dataset.sort != null).map((c) => c.dataset.sort));
  });
}

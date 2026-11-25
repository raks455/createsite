// Schema-driven form builder. Every editor in the admin (sections, page
// settings, site settings) is generated from field descriptors served by
// /api/schema. Inputs write straight into the given object and call
// ctx.onChange(), so the caller just saves that object.
import { h, uid, stripHtml } from '../core/dom.js';
import { iconBtn, sortable } from '../core/ui.js';
import { openMediaPicker } from '../components/mediaLibrary.js';
import { icon } from '../core/icons.js';

const HEX = /^#[0-9a-f]{6}$/i;
const normalizeOptions = (opts = []) => opts.map((o) => (typeof o === 'object' ? o : { value: o, label: o }));

export function buildFields(fields, obj, ctx) {
  return h('div', { class: 'fields' }, fields.map((fd) => buildField(fd, obj, ctx)));
}

function wrap(fd, input) {
  return h('div', { class: `fld${fd.half ? ' half' : ''}` },
    h('label', { class: 'lbl' }, fd.label), input, fd.help ? h('small', { class: 'help' }, fd.help) : null);
}

function buildField(fd, obj, ctx) {
  const set = (v) => { obj[fd.key] = v; ctx.onChange(); };
  const value = obj[fd.key];

  switch (fd.type) {
    case 'textarea':
      return wrap(fd, h('textarea', { rows: fd.rows || 3, value: value ?? '', oninput: (e) => set(e.target.value) }));
    case 'code':
      return wrap(fd, codeInput(fd, value, set));
    case 'number':
      return wrap(fd, h('input', { type: 'number', step: fd.step || 'any', min: fd.min, max: fd.max, value: value ?? '',
        oninput: (e) => set(e.target.value === '' ? '' : Number(e.target.value)) }));
    case 'toggle':
      return h('label', { class: `fld toggle${fd.half ? ' half' : ''}` },
        h('input', { type: 'checkbox', checked: !!value, onchange: (e) => set(e.target.checked) }),
        h('span', { class: 'switch' }), h('span', { class: 'toggle-text' }, fd.label,
          fd.help ? h('small', { class: 'help' }, fd.help) : null));
    case 'select': {
      const sel = h('select', { onchange: (e) => set(e.target.value) },
        normalizeOptions(fd.options).map((o) => h('option', { value: o.value }, o.label)));
      sel.value = value ?? normalizeOptions(fd.options)[0]?.value ?? '';
      return wrap(fd, sel);
    }
    case 'page': {
      const sel = h('select', { onchange: (e) => set(e.target.value) },
        (ctx.site?.pages || []).map((p) => h('option', { value: p.id }, `${p.title}  (/${p.slug})`)));
      sel.value = value || ctx.site?.pages?.[0]?.id || '';
      return wrap(fd, sel);
    }
    case 'lines':
      return wrap(fd, h('textarea', { rows: 3, value: (Array.isArray(value) ? value : []).join('\n'),
        oninput: (e) => set(e.target.value.split('\n').map((s) => s.trim()).filter(Boolean)) }));
    case 'font':
      return wrap(fd, h('input', { type: 'text', list: 'sf-fonts', value: value ?? '', placeholder: 'e.g. Inter', oninput: (e) => set(e.target.value) }));
    case 'url':
      return wrap(fd, h('input', { type: 'text', list: 'sf-links', value: value ?? '', placeholder: '/page, #section or https://…', oninput: (e) => set(e.target.value) }));
    case 'color':
      return wrap(fd, colorInput(value, set));
    case 'image':
      return wrap(fd, imageInput(value, set, ctx));
    case 'richtext':
      return wrap(fd, richText(value, set));
    case 'list':
      return listField(fd, obj, ctx);
    default:
      return wrap(fd, h('input', { type: 'text', value: value ?? '', oninput: (e) => set(e.target.value) }));
  }
}

function codeInput(fd, value, set) {
  const ta = h('textarea', { class: 'code', rows: fd.rows || 8, spellcheck: 'false', value: value ?? '', oninput: (e) => set(e.target.value) });
  ta.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const { selectionStart: s, selectionEnd: end } = ta;
    ta.setRangeText('  ', s, end, 'end');
    set(ta.value);
  });
  return ta;
}

function colorInput(value, set) {
  const text = h('input', { type: 'text', value: value || '', placeholder: 'none', class: 'color-text',
    oninput: (e) => { set(e.target.value); if (HEX.test(e.target.value)) picker.value = e.target.value; swatch(); } });
  const picker = h('input', { type: 'color', value: HEX.test(value) ? value : '#000000',
    oninput: (e) => { text.value = e.target.value; set(e.target.value); swatch(); } });
  const swatchEl = h('span', { class: 'swatch' }, picker);
  const swatch = () => { swatchEl.style.background = text.value || 'transparent'; swatchEl.classList.toggle('empty', !text.value); };
  swatch();
  return h('div', { class: 'color-row' }, swatchEl, text, h('button', { class: 'icon-btn', type: 'button', title: 'Clear', onclick: () => { text.value = ''; set(''); swatch(); } }, '✕'));
}

function imageInput(value, set, ctx) {
  const preview = h('div', { class: 'img-prev' });
  const input = h('input', { type: 'text', value: value || '', placeholder: 'Image URL or choose from library', oninput: (e) => { set(e.target.value); update(); } });
  const update = () => {
    preview.replaceChildren(input.value ? h('img', { src: input.value, alt: '' }) : h('span', { class: 'muted' }, 'No image'));
  };
  update();
  const choose = () => openMediaPicker(ctx.site.id, (url) => { input.value = url; set(url); update(); });
  return h('div', { class: 'img-field' }, h('button', { type: 'button', class: 'img-thumb', onclick: choose }, preview),
    h('div', { class: 'img-ctl' }, input, h('div', { class: 'row' },
      h('button', { type: 'button', class: 'btn sm', onclick: choose }, '📁 Choose / upload'),
      h('button', { type: 'button', class: 'btn sm ghost', onclick: () => { input.value = ''; set(''); update(); } }, 'Remove'))));
}

function richText(value, set) {
  const editor = h('div', { class: 'rich', contenteditable: 'true', html: value || '' });
  const source = h('textarea', { class: 'code rich-src', rows: 10, hidden: true });
  const sync = () => set(editor.innerHTML);
  editor.addEventListener('input', sync);
  source.addEventListener('input', () => set(source.value));
  const cmd = (name, arg) => { editor.focus(); document.execCommand(name, false, arg); sync(); };
  const tool = (label, title, fn) => h('button', { type: 'button', title, onmousedown: (e) => e.preventDefault(), onclick: fn }, label);
  const toolbar = h('div', { class: 'rich-bar' },
    tool('B', 'Bold', () => cmd('bold')), tool('I', 'Italic', () => cmd('italic')), tool('U', 'Underline', () => cmd('underline')),
    h('span', { class: 'sep' }),
    tool('H2', 'Heading', () => cmd('formatBlock', '<h2>')), tool('H3', 'Subheading', () => cmd('formatBlock', '<h3>')),
    tool('¶', 'Paragraph', () => cmd('formatBlock', '<p>')), tool('❝', 'Quote', () => cmd('formatBlock', '<blockquote>')),
    h('span', { class: 'sep' }),
    tool('•', 'Bullet list', () => cmd('insertUnorderedList')), tool('1.', 'Numbered list', () => cmd('insertOrderedList')),
    tool('🔗', 'Link', () => { const url = prompt('Link URL', 'https://'); if (url) cmd('createLink', url); }),
    tool('⛓', 'Remove link', () => cmd('unlink')), tool('⌫', 'Clear formatting', () => cmd('removeFormat')),
    h('span', { class: 'sep' }),
    tool('</>', 'Edit HTML', () => {
      const showSource = source.hidden;
      if (showSource) source.value = editor.innerHTML; else { editor.innerHTML = source.value; sync(); }
      source.hidden = !showSource; editor.hidden = showSource;
    }));
  return h('div', { class: 'rich-wrap' }, toolbar, editor, source);
}

function itemLabel(fd, item, i) {
  for (const k of ['title', 'label', 'name', 'question', 'caption', 'value', 'quote']) {
    if (item[k]) return String(item[k]).slice(0, 60);
  }
  if (item.content) { const t = stripHtml(item.content).trim(); if (t) return t.slice(0, 60); }
  return `${fd.itemLabel || 'Item'} ${i + 1}`;
}

function listField(fd, obj, ctx) {
  if (!Array.isArray(obj[fd.key])) obj[fd.key] = [];
  const items = obj[fd.key];
  const keys = new WeakMap();
  const keyOf = (it) => { if (!keys.has(it)) keys.set(it, uid('i_')); return keys.get(it); };
  const open = new Set();
  const container = h('div', { class: 'list-items' });

  const draw = () => {
    container.replaceChildren(...items.map((item, i) => {
      const k = keyOf(item);
      const isOpen = open.has(k);
      const title = h('span', { class: 'li-title' }, itemLabel(fd, item, i));
      const toggle = () => { isOpen ? open.delete(k) : open.add(k); draw(); };
      const head = h('div', { class: 'li-head', onclick: (e) => { if (!e.target.closest('button,.handle')) toggle(); } },
        h('span', { class: 'handle', title: 'Drag to reorder' }, '⋮⋮'), h('span', { class: 'caret' }, isOpen ? '▾' : '▸'), title,
        h('span', { class: 'li-actions' },
          iconBtn(icon('copy', 14), 'Duplicate', () => { const c = structuredClone(item); items.splice(i + 1, 0, c); open.add(keyOf(c)); ctx.onChange(); draw(); }),
          iconBtn(icon('trash', 14), 'Remove', () => { items.splice(i, 1); ctx.onChange(); draw(); }, 'danger')));
      const body = isOpen ? h('div', { class: 'li-body' }, buildFields(fd.fields, item, {
        ...ctx, onChange: () => { title.textContent = itemLabel(fd, item, i); ctx.onChange(); },
      })) : null;
      return h('div', { class: `li${isOpen ? ' open' : ''}`, 'data-sort': k }, head, body);
    }));
  };

  sortable(container, (order) => {
    items.sort((a, b) => order.indexOf(keyOf(a)) - order.indexOf(keyOf(b)));
    ctx.onChange();
    draw();
  });
  draw();

  const add = h('button', { type: 'button', class: 'btn sm add-item', onclick: () => {
    const item = structuredClone(fd.item || {});
    items.push(item);
    open.add(keyOf(item));
    ctx.onChange();
    draw();
  } }, `+ Add ${(fd.itemLabel || 'item').toLowerCase()}`);

  return h('div', { class: 'fld list-fld' }, h('label', { class: 'lbl' }, fd.label, h('span', { class: 'count' }, ` (${items.length})`)), container, add);
}

/** Keeps the <datalist> of internal link suggestions in sync with a site. */
export function updateLinkSuggestions(site, extra = []) {
  const dl = document.getElementById('sf-links');
  if (!dl || !site) return;
  const values = ['/', ...site.pages.map((p) => `/${p.slug}`), ...extra, 'mailto:', 'tel:'];
  dl.replaceChildren(...[...new Set(values)].map((v) => h('option', { value: v })));
}

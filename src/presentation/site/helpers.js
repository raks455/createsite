'use strict';
// HTML helpers shared by all section renderers. Everything user-provided goes
// through esc() unless it is intentionally HTML (rich text / custom HTML).
const MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => MAP[c]);
const nl = (v) => esc(v).replace(/\r?\n/g, '<br>');
/** Strips characters that could break out of a CSS declaration. */
const cssValue = (v) => String(v ?? '').replace(/[;{}<>"'\\]/g, '').trim();
/** Makes text safe inside a <style> / <script> element. */
const safeCss = (v) => String(v || '').replace(/<\/style/gi, '<\\/style');
const safeJs = (v) => String(v || '').replace(/<\/script/gi, '<\\/script');
const hasValue = (v) => v !== '' && v !== null && v !== undefined && !Number.isNaN(v);

/**
 * Creates helpers bound to a render context.
 * `base` is prepended to site-internal links ("/about" -> "/s/my-site/about").
 */
function createHelpers({ base = '', mode = 'live', site, page, settings }) {
  const url = (value) => {
    const v = String(value ?? '').trim();
    if (!v) return '#';
    if (/^(https?:|mailto:|tel:|sms:|#|\/\/|data:)/i.test(v)) return esc(v);
    if (v.startsWith('/uploads/')) return esc(v);
    if (v.startsWith('/')) return esc(base + v);
    return esc(v);
  };
  const img = (src, alt = '', cls = '') =>
    src ? `<img src="${esc(src)}" alt="${esc(alt)}"${cls ? ` class="${esc(cls)}"` : ''} loading="lazy">` : '';
  const btn = (text, href, variant = '') =>
    text ? `<a class="btn${variant ? ` btn-${variant}` : ''}" href="${url(href)}">${esc(text)}</a>` : '';
  const btns = (...items) => {
    const html = items.map(([text, href, variant]) => btn(text, href, variant)).join('');
    return html ? `<div class="btns">${html}</div>` : '';
  };
  const eyebrow = (t) => (t ? `<div class="eyebrow">${esc(t)}</div>` : '');
  const head = (d) =>
    d.eyebrow || d.title || d.subtitle
      ? `<div class="sec-head">${eyebrow(d.eyebrow)}${d.title ? `<h2>${esc(d.title)}</h2>` : ''}${d.subtitle ? `<p>${nl(d.subtitle)}</p>` : ''}</div>`
      : '';
  const cols = (n, max = 4) => `c${Math.min(Math.max(parseInt(n, 10) || 3, 1), max)}`;

  return { esc, nl, url, img, btn, btns, eyebrow, head, cols, cssValue, base, mode, site, page, settings };
}

module.exports = { esc, nl, cssValue, safeCss, safeJs, hasValue, createHelpers };

'use strict';
// Turns theme/header/footer settings into CSS custom properties.
const { cssValue, hasValue } = require('./helpers');
const { fontStack } = require('./fonts');

const SHADOWS = {
  none: 'none',
  soft: '0 1px 2px rgba(16,24,40,.04),0 6px 20px rgba(16,24,40,.06)',
  medium: '0 4px 10px rgba(16,24,40,.06),0 14px 36px rgba(16,24,40,.11)',
  strong: '0 10px 24px rgba(16,24,40,.12),0 28px 64px rgba(16,24,40,.2)',
};

const v = (value, fallback) => (hasValue(value) && String(value).trim() !== '' ? cssValue(value) : fallback);
const n = (value, fallback) => (hasValue(value) && !Number.isNaN(Number(value)) ? Number(value) : fallback);

function themeCss(settings) {
  const t = settings.theme, h = settings.header, f = settings.footer;
  const radius = n(t.radius, 14);
  const btnRadius = t.buttonShape === 'pill' ? '999px' : t.buttonShape === 'square' ? '0px' : `${Math.min(radius, 12)}px`;
  const vars = {
    '--primary': v(t.primary, '#4f46e5'),
    '--on-primary': v(t.onPrimary, '#ffffff'),
    '--secondary': v(t.secondary, '#0ea5e9'),
    '--bg': v(t.bg, '#ffffff'),
    '--surface': v(t.surface, '#f5f6fa'),
    '--card': v(t.card, '#ffffff'),
    '--text': v(t.text, '#3a4052'),
    '--heading': v(t.headingColor, v(t.text, '#0f1222')),
    '--muted': v(t.muted, '#646b80'),
    '--border': v(t.border, '#e4e6ee'),
    '--font-heading': fontStack(t.headingFont),
    '--font-body': fontStack(t.bodyFont),
    '--fs': `${n(t.baseSize, 17)}px`,
    '--lh': n(t.lineHeight, 1.65),
    '--hw': v(t.headingWeight, '700'),
    '--hls': v(t.headingSpacing, 'normal'),
    '--h1': `${n(t.h1Size, 3.6)}rem`,
    '--h2': `${n(t.h2Size, 2.5)}rem`,
    '--radius': `${radius}px`,
    '--btn-radius': btnRadius,
    '--btn-tt': t.buttonUppercase ? 'uppercase' : 'none',
    '--btn-ls': t.buttonUppercase ? '.06em' : 'normal',
    '--shadow': SHADOWS[t.shadow] || SHADOWS.soft,
    '--container': `${n(t.containerWidth, 1180)}px`,
    '--sec-pad': `${n(t.sectionPadding, 96)}px`,
    '--hdr-bg': v(h.bg, '#ffffff'),
    '--hdr-text': v(h.textColor, '#0f1222'),
    '--hdr-ttext': v(h.transparentText, '#ffffff'),
    '--hdr-h': `${n(h.height, 76)}px`,
    '--logo-h': `${n(h.logoHeight, 36)}px`,
    '--ann-bg': v(h.announcementBg, '#0f1222'),
    '--ann-text': v(h.announcementColor, '#ffffff'),
    '--ftr-bg': v(f.bg, '#0f1222'),
    '--ftr-text': v(f.textColor, '#c4c8d4'),
  };
  const body = Object.entries(vars).map(([k, val]) => `${k}:${val}`).join(';');
  return `:root{${body}}@media(max-width:768px){:root{--sec-pad:${Math.round(n(t.sectionPadding, 96) * 0.65)}px}}`;
}

module.exports = { themeCss };

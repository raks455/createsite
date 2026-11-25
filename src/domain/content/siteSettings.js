'use strict';
// Content model for site-wide settings, page settings and per-section styling.
const { f, list, emptyValue } = require('./fields');
const { clone } = require('../util');

const linkFields = [f('label', 'Label', 'text', { half: true }), f('url', 'Link', 'url', { half: true }), f('newTab', 'Open in new tab', 'toggle')];

const SITE_SETTINGS = {
  general: {
    label: 'Site settings',
    description: 'Name, web address, domains and visibility.',
    fields: [
      f('name', 'Site name', 'text', { default: 'My Site' }),
      f('slug', 'URL slug', 'text', { default: 'my-site', help: 'The site is available at /s/<slug>/ on this server.' }),
      f('domains', 'Custom domains', 'lines', { default: [], help: 'One per line, e.g. example.com and www.example.com. Point the domain DNS at this server and the site is served at its root.' }),
      f('homePage', 'Home page', 'page', { default: '' }),
      f('lang', 'Language code', 'text', { default: 'en', half: true }),
      f('formEndpoint', 'Form endpoint (static export only)', 'url', { default: '', half: true, help: 'For exported ZIP sites, e.g. a Formspree URL. Live sites store entries here automatically.' }),
      f('maintenance', 'Coming-soon / maintenance mode', 'toggle', { default: false, help: 'Visitors see a coming-soon screen. You still see the real site while signed in.' }),
      f('maintenanceTitle', 'Coming-soon title', 'text', { default: 'Coming soon' }),
      f('maintenanceMessage', 'Coming-soon message', 'textarea', { default: "We're working on something great. Check back soon!" }),
    ],
  },
  theme: {
    label: 'Design',
    description: 'Colors, typography, spacing and shapes used across the whole site.',
    fields: [
      f('primary', 'Primary / brand color', 'color', { default: '#4f46e5', half: true }),
      f('onPrimary', 'Text on primary color', 'color', { default: '#ffffff', half: true }),
      f('secondary', 'Secondary color', 'color', { default: '#0ea5e9', half: true }),
      f('bg', 'Page background', 'color', { default: '#ffffff', half: true }),
      f('surface', 'Alternate background', 'color', { default: '#f5f6fa', half: true }),
      f('card', 'Card background', 'color', { default: '#ffffff', half: true }),
      f('text', 'Body text', 'color', { default: '#3a4052', half: true }),
      f('headingColor', 'Headings', 'color', { default: '#0f1222', half: true }),
      f('muted', 'Muted text', 'color', { default: '#646b80', half: true }),
      f('border', 'Borders', 'color', { default: '#e4e6ee', half: true }),
      f('headingFont', 'Heading font', 'font', { default: 'Inter', half: true }),
      f('bodyFont', 'Body font', 'font', { default: 'Inter', half: true }),
      f('baseSize', 'Base font size (px)', 'number', { default: 17, half: true }),
      f('lineHeight', 'Line height', 'number', { default: 1.65, step: 0.05, half: true }),
      f('headingWeight', 'Heading weight', 'select', { default: '700', half: true, options: ['300', '400', '500', '600', '700', '800', '900'] }),
      f('headingSpacing', 'Heading letter spacing', 'text', { default: '-0.02em', half: true }),
      f('h1Size', 'H1 size (rem)', 'number', { default: 3.6, step: 0.1, half: true }),
      f('h2Size', 'H2 size (rem)', 'number', { default: 2.5, step: 0.1, half: true }),
      f('radius', 'Corner radius (px)', 'number', { default: 14, half: true }),
      f('buttonShape', 'Button shape', 'select', { default: 'rounded', half: true, options: ['rounded', 'pill', 'square'] }),
      f('shadow', 'Shadows', 'select', { default: 'soft', half: true, options: ['none', 'soft', 'medium', 'strong'] }),
      f('buttonUppercase', 'Uppercase buttons', 'toggle', { default: false }),
      f('containerWidth', 'Content max width (px)', 'number', { default: 1180, half: true }),
      f('sectionPadding', 'Section vertical padding (px)', 'number', { default: 96, half: true }),
      f('animations', 'Fade-in animations on scroll', 'toggle', { default: true }),
    ],
  },
  header: {
    label: 'Header & menu',
    description: 'Logo, navigation menu, call-to-action button and announcement bar.',
    fields: [
      f('layout', 'Layout', 'select', { default: 'standard', options: [{ value: 'standard', label: 'Logo left, menu right' }, { value: 'centered', label: 'Centered logo, menu below' }, { value: 'minimal', label: 'Logo + hamburger menu' }] }),
      f('logo', 'Logo image', 'image', { default: '' }),
      f('logoText', 'Logo text', 'text', { default: 'My Site', half: true }),
      f('logoHeight', 'Logo height (px)', 'number', { default: 36, half: true }),
      list('nav', 'Menu items', [...linkFields, list('children', 'Dropdown items', linkFields, { label: 'Link', url: '/', newTab: false }, { itemLabel: 'Link' })],
        { label: 'Page', url: '/', newTab: false, children: [] }, { itemLabel: 'Menu item', default: [] }),
      f('ctaText', 'Button text', 'text', { default: '', half: true }),
      f('ctaUrl', 'Button link', 'url', { default: '', half: true }),
      f('bg', 'Background', 'color', { default: '#ffffff', half: true }),
      f('textColor', 'Text color', 'color', { default: '#0f1222', half: true }),
      f('height', 'Header height (px)', 'number', { default: 76, half: true }),
      f('sticky', 'Sticky (stays on top while scrolling)', 'toggle', { default: true }),
      f('transparent', 'Transparent over the first section', 'toggle', { default: false, help: 'Great with a full-screen hero image.' }),
      f('transparentText', 'Text color while transparent', 'color', { default: '#ffffff' }),
      f('announcement', 'Announcement bar text', 'text', { default: '' }),
      f('announcementUrl', 'Announcement link', 'url', { default: '', half: true }),
      f('announcementBg', 'Announcement background', 'color', { default: '#0f1222', half: true }),
      f('announcementColor', 'Announcement text', 'color', { default: '#ffffff', half: true }),
    ],
  },
  footer: {
    label: 'Footer',
    description: 'Footer text, link columns, social links and colors.',
    fields: [
      f('layout', 'Layout', 'select', { default: 'full', options: [{ value: 'full', label: 'Full (about + columns)' }, { value: 'simple', label: 'Simple (one line)' }] }),
      f('showLogo', 'Show logo', 'toggle', { default: true }),
      f('about', 'About text', 'textarea', { default: '' }),
      list('columns', 'Link columns', [f('title', 'Column title'), list('links', 'Links', linkFields, { label: 'Link', url: '/', newTab: false }, { itemLabel: 'Link' })],
        { title: 'Links', links: [] }, { itemLabel: 'Column', default: [] }),
      list('social', 'Social links', [f('label', 'Label (e.g. Instagram)', 'text', { half: true }), f('url', 'URL', 'url', { half: true })],
        { label: 'Instagram', url: 'https://instagram.com/' }, { itemLabel: 'Social link', default: [] }),
      f('copyright', 'Copyright line', 'text', { default: '© {year} My Site. All rights reserved.', help: '{year} is replaced with the current year.' }),
      f('bg', 'Background', 'color', { default: '#0f1222', half: true }),
      f('textColor', 'Text color', 'color', { default: '#c4c8d4', half: true }),
    ],
  },
  seo: {
    label: 'SEO & sharing',
    description: 'How the site appears in search engines and when shared on social media.',
    fields: [
      f('titleTemplate', 'Title template', 'text', { default: '%s | My Site', help: '%s is replaced by the page title.' }),
      f('description', 'Default meta description', 'textarea', { default: '' }),
      f('keywords', 'Keywords', 'text', { default: '' }),
      f('ogImage', 'Social share image', 'image', { default: '' }),
      f('favicon', 'Favicon', 'image', { default: '' }),
      f('noindex', 'Hide from search engines (noindex)', 'toggle', { default: false }),
    ],
  },
  code: {
    label: 'Custom code',
    description: 'Add your own CSS, JavaScript, analytics or anything else.',
    fields: [
      f('customCss', 'Custom CSS', 'code', { default: '', rows: 12 }),
      f('customJs', 'Custom JavaScript', 'code', { default: '', rows: 8, help: 'Runs at the end of every page.' }),
      f('headCode', 'Code inside <head>', 'code', { default: '', help: 'Analytics, meta tags, external stylesheets…' }),
      f('bodyCode', 'Code before </body>', 'code', { default: '', help: 'Chat widgets, tracking pixels…' }),
    ],
  },
};

const PAGE_FIELDS = [
  f('title', 'Page title', 'text', { half: true }),
  f('slug', 'URL path', 'text', { half: true, help: 'e.g. about or services/web-design. Ignored for the home page. Use 404 for a custom not-found page.' }),
  f('published', 'Published', 'toggle', { help: 'Unpublished pages are only visible while signed in.' }),
  f('seoTitle', 'SEO title (overrides the title template)'),
  f('seoDescription', 'Meta description', 'textarea'),
  f('seoImage', 'Social share image', 'image'),
  f('hideHeader', 'Hide header on this page', 'toggle'),
  f('hideFooter', 'Hide footer on this page', 'toggle'),
  f('bodyClass', 'Body CSS class'),
  f('css', 'Page CSS', 'code'),
];

const SECTION_STYLE_FIELDS = [
  f('tone', 'Color scheme', 'select', { options: [{ value: 'default', label: 'Default' }, { value: 'surface', label: 'Alternate background' }, { value: 'primary', label: 'Brand color' }, { value: 'dark', label: 'Dark' }] }),
  f('bg', 'Background color', 'color', { half: true }),
  f('textColor', 'Text color', 'color', { half: true }),
  f('bgImage', 'Background image', 'image'),
  f('overlay', 'Image darkening (0–90)', 'number', { min: 0, max: 90, half: true }),
  f('width', 'Content width', 'select', { half: true, options: ['default', 'narrow', 'wide', 'full', 'edge'] }),
  f('paddingTop', 'Padding top (px)', 'number', { half: true, help: 'Empty = theme default' }),
  f('paddingBottom', 'Padding bottom (px)', 'number', { half: true }),
  f('align', 'Text alignment', 'select', { half: true, options: ['left', 'center', 'right'] }),
  f('anchor', 'Anchor ID', 'text', { half: true, help: 'Link to it with #id' }),
  f('className', 'Extra CSS classes'),
  f('css', 'Section CSS', 'code', { help: 'Use & to target this section, e.g.  & h2 { color: red }' }),
  f('hideMobile', 'Hide on mobile', 'toggle'),
  f('hideDesktop', 'Hide on desktop', 'toggle'),
  f('hidden', 'Hide this section', 'toggle'),
];

function defaultSettings() {
  const out = {};
  for (const [group, def] of Object.entries(SITE_SETTINGS)) {
    out[group] = {};
    for (const fd of def.fields) out[group][fd.key] = clone(fd.default ?? emptyValue(fd));
  }
  return out;
}

/** Fills in defaults for any missing keys (so new fields work on old sites). */
function resolveSettings(settings = {}) {
  const d = defaultSettings();
  for (const g of Object.keys(d)) d[g] = { ...d[g], ...((settings && settings[g]) || {}) };
  return d;
}

module.exports = { SITE_SETTINGS, PAGE_FIELDS, SECTION_STYLE_FIELDS, defaultSettings, resolveSettings };

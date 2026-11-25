'use strict';
// Starter templates offered when creating a site. Each builds settings + pages
// from the domain factories, so they always produce valid sites.
const { createSection: s, createPage } = require('../domain/entities/Page');

const pic = (seed, w = 1200, h = 800) => `https://picsum.photos/seed/${seed}/${w}/${h}`;
const nav = (label, url, children = []) => ({ label, url, newTab: false, children });
const link = (label, url) => ({ label, url, newTab: false });
const page = (title, slug, blocks) => createPage({ title, slug, blocks });

function base(name) {
  return {
    header: { logoText: name },
    footer: { copyright: `© {year} ${name}. All rights reserved.` },
    seo: { titleTemplate: `%s | ${name}` },
  };
}

const TEMPLATES = {
  blank: {
    label: 'Blank', icon: '⬜', description: 'One empty page — build everything yourself.',
    build: (name) => ({
      settings: { header: { nav: [nav('Home', '/')] } },
      pages: [page('Home', 'home', [s('hero', { title: name, subtitle: 'Start editing this page in the admin panel.', primaryText: '', secondaryText: '', eyebrow: '' })])],
    }),
  },

  business: {
    label: 'Business', icon: '🏢', description: 'Company or agency: home, services, about and contact pages.',
    build: (name) => ({
      settings: {
        theme: { primary: '#2563eb', headingFont: 'Plus Jakarta Sans', bodyFont: 'Inter' },
        header: {
          nav: [nav('Home', '/'), nav('Services', '/services'), nav('About', '/about'), nav('Contact', '/contact')],
          ctaText: 'Get a quote', ctaUrl: '/contact',
        },
        footer: {
          about: `${name} helps growing businesses work smarter with strategy, design and technology.`,
          columns: [
            { title: 'Company', links: [link('About', '/about'), link('Services', '/services'), link('Contact', '/contact')] },
            { title: 'Contact', links: [link('hello@example.com', 'mailto:hello@example.com'), link('+1 (555) 010-2030', 'tel:+15550102030')] },
          ],
          social: [link('LinkedIn', 'https://linkedin.com'), link('Instagram', 'https://instagram.com')],
        },
      },
      pages: [
        page('Home', 'home', [
          s('hero', { layout: 'split', eyebrow: 'Trusted by 500+ businesses', title: 'We help ambitious companies grow faster', subtitle: 'Strategy, design and technology under one roof — so you can focus on running your business.', primaryText: 'Book a free call', primaryUrl: '/contact', secondaryText: 'Our services', secondaryUrl: '/services', image: pic('sf-biz-hero', 1200, 950), minHeight: 0 }, { align: 'left' }),
          s('features', { eyebrow: 'What we do', title: 'Services built around your goals', subtitle: 'From the first idea to long-term growth, we have you covered.', items: [
            { icon: '📈', title: 'Strategy', image: '', text: 'Clear plans based on research, data and real business goals.', linkText: 'Learn more', linkUrl: '/services' },
            { icon: '🎨', title: 'Design', image: '', text: 'Brands and websites that look great and convert visitors.', linkText: 'Learn more', linkUrl: '/services' },
            { icon: '⚙️', title: 'Technology', image: '', text: 'Reliable systems and automation that save you time.', linkText: 'Learn more', linkUrl: '/services' },
          ] }),
          s('imageText', { image: pic('sf-biz-team', 1000, 800), eyebrow: 'Why us', title: 'A partner, not just a provider', content: '<p>We work as an extension of your team. Honest advice, clear communication and measurable results.</p><ul><li>Dedicated project manager</li><li>Transparent fixed pricing</li><li>Results you can measure</li></ul>', buttonText: 'About us', buttonUrl: '/about' }, { tone: 'surface' }),
          s('stats', {}, { tone: 'primary' }),
          s('testimonials', {}, { tone: 'default' }),
          s('cta', { title: "Let's build something great together", text: 'Tell us about your project and get a free proposal within 48 hours.', primaryText: 'Get a free quote', primaryUrl: '/contact' }, { tone: 'dark' }),
        ]),
        page('Services', 'services', [
          s('hero', { eyebrow: 'Services', title: 'Everything you need to grow', subtitle: 'Pick one service or combine them into a complete package.', primaryText: '', secondaryText: '', minHeight: 0 }, { tone: 'surface' }),
          s('features', { eyebrow: '', title: '', subtitle: '', cardStyle: 'bordered', items: [
            { icon: '🔍', title: 'Market research', image: '', text: 'Understand your customers and competitors.', linkText: '', linkUrl: '' },
            { icon: '🧭', title: 'Brand strategy', image: '', text: 'Positioning and messaging that stands out.', linkText: '', linkUrl: '' },
            { icon: '🖥️', title: 'Web design', image: '', text: 'Fast, beautiful websites that convert.', linkText: '', linkUrl: '' },
            { icon: '📱', title: 'App development', image: '', text: 'Web and mobile apps built to scale.', linkText: '', linkUrl: '' },
            { icon: '📣', title: 'Marketing', image: '', text: 'Campaigns that bring the right customers.', linkText: '', linkUrl: '' },
            { icon: '🛟', title: 'Support', image: '', text: 'Ongoing care so everything keeps running.', linkText: '', linkUrl: '' },
          ] }, { align: 'left' }),
          s('steps', {}, { tone: 'surface' }),
          s('faq'),
          s('cta', { primaryUrl: '/contact' }),
        ]),
        page('About', 'about', [
          s('hero', { eyebrow: 'About us', title: `The story of ${name}`, subtitle: 'A small team with big ambitions and a love for doing great work.', primaryText: '', secondaryText: '', minHeight: 0 }, { tone: 'surface' }),
          s('imageText', { image: pic('sf-biz-office', 1000, 800), eyebrow: 'Our story', title: 'Started with a simple idea', content: '<p>We started because we believed small businesses deserve the same quality of work as big brands. Years later, that belief still drives everything we do.</p>', buttonText: '', buttonUrl: '' }),
          s('stats', {}, { tone: 'surface' }),
          s('team'),
          s('cta', { primaryUrl: '/contact' }),
        ]),
        page('Contact', 'contact', [
          s('contact', { mapEmbed: 'https://www.google.com/maps?q=Times+Square+New+York&output=embed' }),
        ]),
      ],
    }),
  },

  saas: {
    label: 'Product / SaaS', icon: '💻', description: 'One-page landing page with features, pricing and FAQ.',
    build: () => ({
      settings: {
        theme: { primary: '#7c3aed', secondary: '#06b6d4', headingFont: 'Outfit', bodyFont: 'Inter', radius: 16, buttonShape: 'pill', surface: '#f6f4fe' },
        header: {
          nav: [nav('Features', '/#features'), nav('How it works', '/#how'), nav('Pricing', '/#pricing'), nav('FAQ', '/#faq')],
          ctaText: 'Start free trial', ctaUrl: '/#pricing', announcement: '🎉 Version 2.0 is here — see what’s new', announcementUrl: '/#features', announcementBg: '#7c3aed',
        },
        footer: { layout: 'simple', social: [link('X', 'https://x.com'), link('GitHub', 'https://github.com')] },
      },
      pages: [
        page('Home', 'home', [
          s('hero', { eyebrow: 'New · Version 2.0', title: 'The all-in-one workspace for modern teams', subtitle: 'Plan projects, share documents and track progress — all in one place your whole team will love.', primaryText: 'Start free trial', primaryUrl: '#pricing', secondaryText: 'See how it works', secondaryUrl: '#how', image: pic('sf-saas-hero', 1600, 900), minHeight: 0 }),
          s('features', { title: 'Everything your team needs', subtitle: 'Powerful features without the complexity.', items: [
            { icon: '🗂️', title: 'Projects', image: '', text: 'Boards, lists and timelines for every way of working.', linkText: '', linkUrl: '' },
            { icon: '📄', title: 'Docs', image: '', text: 'Write and collaborate in real time.', linkText: '', linkUrl: '' },
            { icon: '💬', title: 'Chat', image: '', text: 'Discuss work right where it happens.', linkText: '', linkUrl: '' },
            { icon: '📊', title: 'Reports', image: '', text: 'See progress at a glance with live dashboards.', linkText: '', linkUrl: '' },
            { icon: '🔌', title: 'Integrations', image: '', text: 'Connect the tools you already use.', linkText: '', linkUrl: '' },
            { icon: '🔐', title: 'Security', image: '', text: 'SSO, audit logs and encryption built in.', linkText: '', linkUrl: '' },
          ] }, { anchor: 'features' }),
          s('imageText', { image: pic('sf-saas-1', 1000, 800), imagePosition: 'right', eyebrow: 'Collaboration', title: 'Work together, wherever you are', content: '<p>Comments, mentions and live editing keep everyone on the same page — across time zones.</p>', buttonText: '', buttonUrl: '' }, { tone: 'surface' }),
          s('steps', { title: 'Up and running in minutes' }, { anchor: 'how' }),
          s('stats', {}, { tone: 'dark' }),
          s('pricing', {}, { anchor: 'pricing' }),
          s('testimonials'),
          s('faq', {}, { anchor: 'faq', width: 'narrow' }),
          s('cta', { title: 'Start your free 14-day trial', text: 'No credit card required.', primaryText: 'Get started free', primaryUrl: '#pricing' }),
        ]),
      ],
    }),
  },

  portfolio: {
    label: 'Portfolio', icon: '🎨', description: 'Personal portfolio for designers, photographers and creators.',
    build: (name) => ({
      settings: {
        theme: { primary: '#111111', onPrimary: '#ffffff', headingFont: 'Space Grotesk', bodyFont: 'Inter', radius: 4, buttonShape: 'square', text: '#333333', headingColor: '#0a0a0a', surface: '#f4f4f2' },
        header: { nav: [nav('Work', '/#work'), nav('About', '/about'), nav('Contact', '/#contact')], ctaText: 'Hire me', ctaUrl: '/#contact' },
        footer: { layout: 'simple', bg: '#0a0a0a', social: [link('Instagram', 'https://instagram.com'), link('Dribbble', 'https://dribbble.com'), link('LinkedIn', 'https://linkedin.com')] },
      },
      pages: [
        page('Home', 'home', [
          s('hero', { eyebrow: 'Designer & creative director', title: `Hi, I'm ${name}. I design brands and digital products people love.`, subtitle: 'Currently available for freelance projects.', primaryText: 'See my work', primaryUrl: '#work', secondaryText: 'Get in touch', secondaryUrl: '#contact', minHeight: 70 }, { align: 'left', width: 'default' }),
          s('gallery', { title: 'Selected work', columns: '2', aspect: '4-3', items: [1, 2, 3, 4, 5, 6].map((i) => ({ image: pic(`sf-work${i}`, 1200, 900), caption: ['Brand identity — Lumen', 'Website — Atlas Studio', 'App design — Pulse', 'Packaging — Grove', 'Editorial — North', 'Campaign — Vela'][i - 1], url: '' })) }, { align: 'left', anchor: 'work' }),
          s('testimonials', { columns: '2', items: [
            { quote: 'An incredible eye for detail. Our new brand exceeded every expectation.', name: 'Emma Wilson', role: 'CEO, Lumen', avatar: pic('sf-p1', 200, 200), rating: 5 },
            { quote: 'Fast, thoughtful and a true pleasure to collaborate with.', name: 'David Park', role: 'Founder, Atlas', avatar: pic('sf-p2', 200, 200), rating: 5 },
          ] }),
          s('contact', { title: "Let's work together", subtitle: 'Tell me about your project.', address: '', phone: '' }, { anchor: 'contact' }),
        ]),
        page('About', 'about', [
          s('imageText', { image: pic('sf-portrait', 900, 1100), eyebrow: 'About me', title: `I'm ${name}`, content: '<p>I have spent the last ten years helping startups and established brands tell their stories through design.</p><p>My work has been featured in design publications around the world.</p>', buttonText: 'Download CV', buttonUrl: '#' }),
          s('columns', { title: 'Experience', columns: '3', items: [
            { content: '<h3>2021 — now</h3><p>Independent designer working with clients worldwide.</p>' },
            { content: '<h3>2017 — 2021</h3><p>Design lead at a product studio.</p>' },
            { content: '<h3>2014 — 2017</h3><p>Visual designer at a branding agency.</p>' },
          ] }, { tone: 'surface' }),
        ]),
      ],
    }),
  },

  restaurant: {
    label: 'Restaurant / café', icon: '🍽️', description: 'Full-screen photo hero, menu, gallery, hours and reservations.',
    build: (name) => ({
      settings: {
        theme: { primary: '#b45309', headingFont: 'Playfair Display', bodyFont: 'Lato', bg: '#fffbf5', surface: '#f7efe3', card: '#fffdf9', text: '#4a3d31', headingColor: '#24190f', muted: '#7a6a5a', border: '#eadfce', radius: 6, headingWeight: '600', headingSpacing: '0' },
        header: {
          transparent: true, sticky: true, bg: '#fffbf5', textColor: '#24190f',
          nav: [nav('Menu', '/#menu'), nav('Our story', '/#story'), nav('Gallery', '/#gallery'), nav('Visit', '/#visit')],
          ctaText: 'Book a table', ctaUrl: '/#visit',
        },
        footer: { layout: 'simple', bg: '#24190f', social: [link('Instagram', 'https://instagram.com'), link('Facebook', 'https://facebook.com')] },
      },
      pages: [
        page('Home', 'home', [
          s('hero', { eyebrow: 'Since 2009', title: 'Seasonal food, made with love', subtitle: `Welcome to ${name} — local ingredients, honest cooking and a warm table waiting for you.`, primaryText: 'Book a table', primaryUrl: '#visit', secondaryText: 'View menu', secondaryUrl: '#menu', minHeight: 100 }, { bgImage: pic('sf-food-hero', 1920, 1200), overlay: 55, textColor: '#ffffff' }),
          s('imageText', { image: pic('sf-chef', 1000, 1100), eyebrow: 'Our story', title: 'A kitchen built on tradition', content: '<p>Every dish starts with ingredients from farmers we know by name. Our menu changes with the seasons — so there is always something new to discover.</p>', buttonText: '', buttonUrl: '' }, { anchor: 'story' }),
          s('features', { eyebrow: 'Menu', title: 'Chef’s favourites', subtitle: 'A taste of what is on the menu this season.', cardStyle: 'plain', items: [
            { icon: '', title: 'Wood-fired bread — $8', image: pic('sf-dish1', 800, 600), text: 'Sourdough, cultured butter, sea salt.', linkText: '', linkUrl: '' },
            { icon: '', title: 'Garden risotto — $22', image: pic('sf-dish2', 800, 600), text: 'Spring vegetables, parmesan, herbs.', linkText: '', linkUrl: '' },
            { icon: '', title: 'Slow-roast lamb — $32', image: pic('sf-dish3', 800, 600), text: 'Rosemary, garlic, roasted potatoes.', linkText: '', linkUrl: '' },
          ] }, { anchor: 'menu', tone: 'surface' }),
          s('gallery', { title: 'Inside the restaurant', columns: '4', aspect: '1-1', items: [1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({ image: pic(`sf-rest${i}`, 800, 800), caption: '', url: '' })) }, { anchor: 'gallery', width: 'wide' }),
          s('testimonials', { title: 'What our guests say' }),
          s('contact', {
            eyebrow: 'Visit us', title: 'Reserve your table', subtitle: 'Walk-ins welcome — reservations recommended on weekends.',
            hours: 'Tue–Fri: 5pm – 11pm\nSat–Sun: 12pm – 11pm\nMonday: closed', email: 'table@example.com',
            mapEmbed: 'https://www.google.com/maps?q=Piazza+Navona+Rome&output=embed', submitText: 'Request booking', successMessage: 'Thank you! We will confirm your booking by email.',
            formFields: [
              { label: 'Name', name: 'name', type: 'text', width: 'half', options: '', placeholder: '', required: true },
              { label: 'Email', name: 'email', type: 'email', width: 'half', options: '', placeholder: '', required: true },
              { label: 'Date', name: 'date', type: 'date', width: 'half', options: '', placeholder: '', required: true },
              { label: 'Guests', name: 'guests', type: 'select', width: 'half', options: '1,2,3,4,5,6,7,8+', placeholder: '', required: true },
              { label: 'Notes', name: 'notes', type: 'textarea', width: 'full', options: '', placeholder: 'Allergies, celebrations…', required: false },
            ],
          }, { anchor: 'visit', tone: 'surface' }),
        ]),
      ],
    }),
  },
};

function mergeSettings(a, b) {
  const out = { ...a };
  for (const [group, values] of Object.entries(b || {})) out[group] = { ...(out[group] || {}), ...values };
  return out;
}

module.exports = {
  list: () => Object.entries(TEMPLATES).map(([key, t]) => ({ key, label: t.label, icon: t.icon, description: t.description })),
  build(key, name) {
    const tpl = TEMPLATES[key] || TEMPLATES.blank;
    const { settings, pages } = tpl.build(name);
    return { settings: mergeSettings(base(name), settings), pages };
  },
};

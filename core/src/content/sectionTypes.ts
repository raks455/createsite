// Content model for page sections ("blocks"): their editable fields and
// default content. How each one looks is defined in
// core/src/render/blocks.ts — one renderer per type, same key.
import { f, list } from './fields';

const pic = (seed, w = 1200, h = 800) => `https://picsum.photos/seed/${seed}/${w}/${h}`;
const columns = (def) => f('columns', 'Columns', 'select', { options: ['1', '2', '3', '4'], half: true, default: def });
const heading = [
  f('eyebrow', 'Small label above title', 'text', { half: true }),
  f('title', 'Title', 'text', { half: true }),
  f('subtitle', 'Subtitle', 'textarea'),
];

const SECTION_TYPES = {
  hero: {
    label: 'Hero', icon: '🚀', category: 'Intro',
    description: 'Big headline, text, buttons and an optional image',
    fields: [
      f('eyebrow', 'Small label above title'),
      f('title', 'Title'),
      f('subtitle', 'Subtitle', 'textarea'),
      f('primaryText', 'Primary button', 'text', { half: true }),
      f('primaryUrl', 'Primary button link', 'url', { half: true }),
      f('secondaryText', 'Secondary button', 'text', { half: true }),
      f('secondaryUrl', 'Secondary button link', 'url', { half: true }),
      f('layout', 'Layout', 'select', { options: [{ value: 'center', label: 'Stacked (image below text)' }, { value: 'split', label: 'Side by side (image right)' }] }),
      f('image', 'Image', 'image', { help: 'For a full background image use the “Style & layout” tab.' }),
      f('minHeight', 'Minimum height (% of screen)', 'number', { min: 0, max: 100 }),
    ],
    defaults: {
      eyebrow: 'Welcome', title: 'Build something people love',
      subtitle: 'A short sentence that explains what you do and why it matters to your visitors.',
      primaryText: 'Get started', primaryUrl: '#contact', secondaryText: 'Learn more', secondaryUrl: '#features',
      layout: 'center', image: '', minHeight: 60,
    },
    defaultStyle: { align: 'center' },
  },

  text: {
    label: 'Rich text', icon: '📝', category: 'Content',
    description: 'Free text with headings, lists, links and images',
    fields: [f('title', 'Title'), f('content', 'Content', 'richtext')],
    defaults: { title: '', content: '<h2>A headline</h2><p>Write anything here. Use the toolbar for <strong>bold text</strong>, lists and links.</p>' },
    defaultStyle: { width: 'narrow' },
  },

  imageText: {
    label: 'Image + text', icon: '🖼️', category: 'Content',
    description: 'An image beside text with a button',
    fields: [
      f('image', 'Image', 'image'),
      f('imagePosition', 'Image position', 'select', { options: ['left', 'right'], half: true }),
      f('eyebrow', 'Small label', 'text', { half: true }),
      f('title', 'Title'),
      f('content', 'Content', 'richtext'),
      f('buttonText', 'Button text', 'text', { half: true }),
      f('buttonUrl', 'Button link', 'url', { half: true }),
    ],
    defaults: {
      image: pic('sf-split', 1000, 800), imagePosition: 'left', eyebrow: 'About us', title: 'A story worth telling',
      content: '<p>Explain who you are, what makes you different and why people should choose you.</p>',
      buttonText: 'Learn more', buttonUrl: '#',
    },
  },

  columns: {
    label: 'Text columns', icon: '▥', category: 'Content',
    description: 'Several columns of rich text',
    fields: [...heading, columns('2'), list('items', 'Columns', [f('content', 'Content', 'richtext')], { content: '<h3>Column</h3><p>Text</p>' }, { itemLabel: 'Column' })],
    defaults: { eyebrow: '', title: '', subtitle: '', columns: '2', items: [{ content: '<h3>First column</h3><p>Some text.</p>' }, { content: '<h3>Second column</h3><p>Some text.</p>' }] },
  },

  features: {
    label: 'Features / cards', icon: '✨', category: 'Content',
    description: 'A grid of cards with an icon or image',
    fields: [
      ...heading, columns('3'),
      f('cardStyle', 'Card style', 'select', { options: ['raised', 'bordered', 'plain'], half: true }),
      list('items', 'Cards', [
        f('icon', 'Icon (emoji or short text)', 'text', { half: true }),
        f('title', 'Title', 'text', { half: true }),
        f('image', 'Image (shown instead of the icon)', 'image'),
        f('text', 'Text', 'textarea'),
        f('linkText', 'Link text', 'text', { half: true }),
        f('linkUrl', 'Link', 'url', { half: true }),
      ], { icon: '⭐', title: 'Feature', image: '', text: 'Describe this feature.', linkText: '', linkUrl: '' }, { itemLabel: 'Card' }),
    ],
    defaults: {
      eyebrow: 'Features', title: 'Everything you need', subtitle: 'Short supporting text for this section.', columns: '3', cardStyle: 'raised',
      items: [
        { icon: '⚡', title: 'Fast', image: '', text: 'Describe the first benefit in a sentence or two.', linkText: '', linkUrl: '' },
        { icon: '🎯', title: 'Focused', image: '', text: 'Describe the second benefit in a sentence or two.', linkText: '', linkUrl: '' },
        { icon: '🔒', title: 'Reliable', image: '', text: 'Describe the third benefit in a sentence or two.', linkText: '', linkUrl: '' },
      ],
    },
    defaultStyle: { align: 'center' },
  },

  steps: {
    label: 'Steps / process', icon: '🔢', category: 'Content',
    description: 'Numbered steps that explain how it works',
    fields: [...heading, columns('3'), list('items', 'Steps', [f('title', 'Title'), f('text', 'Text', 'textarea')], { title: 'Step', text: '' }, { itemLabel: 'Step' })],
    defaults: {
      eyebrow: 'How it works', title: 'Three simple steps', subtitle: '', columns: '3',
      items: [{ title: 'Tell us what you need', text: 'A short explanation.' }, { title: 'We get to work', text: 'A short explanation.' }, { title: 'Enjoy the results', text: 'A short explanation.' }],
    },
    defaultStyle: { align: 'center' },
  },

  stats: {
    label: 'Numbers / stats', icon: '📊', category: 'Social proof',
    description: 'Big numbers that build trust',
    fields: [...heading, columns('4'), list('items', 'Numbers', [f('value', 'Value (e.g. 98%)', 'text', { half: true }), f('label', 'Label', 'text', { half: true })], { value: '100+', label: 'Label' }, { itemLabel: 'Number' })],
    defaults: {
      eyebrow: '', title: '', subtitle: '', columns: '4',
      items: [{ value: '12+', label: 'Years of experience' }, { value: '850', label: 'Happy clients' }, { value: '98%', label: 'Satisfaction rate' }, { value: '24/7', label: 'Support' }],
    },
    defaultStyle: { align: 'center' },
  },

  testimonials: {
    label: 'Testimonials', icon: '💬', category: 'Social proof',
    description: 'Quotes from happy customers',
    fields: [
      ...heading, columns('3'),
      list('items', 'Testimonials', [
        f('quote', 'Quote', 'textarea'),
        f('name', 'Name', 'text', { half: true }),
        f('role', 'Role / company', 'text', { half: true }),
        f('avatar', 'Photo', 'image'),
        f('rating', 'Stars (0–5)', 'number', { min: 0, max: 5, half: true }),
      ], { quote: 'They were amazing to work with.', name: 'Customer', role: '', avatar: '', rating: 5 }, { itemLabel: 'Testimonial' }),
    ],
    defaults: {
      eyebrow: 'Testimonials', title: 'Loved by our customers', subtitle: '', columns: '3',
      items: [
        { quote: 'Working with them was the best decision we made this year. Professional, fast and friendly.', name: 'Sarah Johnson', role: 'Founder, Bloom', avatar: pic('sf-a1', 200, 200), rating: 5 },
        { quote: 'Clear communication, great quality and they delivered ahead of schedule.', name: 'Michael Chen', role: 'CTO, Northwave', avatar: pic('sf-a2', 200, 200), rating: 5 },
        { quote: 'I recommend them to everyone. Our results doubled within three months.', name: 'Priya Sharma', role: 'Marketing Lead', avatar: pic('sf-a3', 200, 200), rating: 5 },
      ],
    },
    defaultStyle: { align: 'center', tone: 'surface' },
  },

  pricing: {
    label: 'Pricing', icon: '💳', category: 'Commerce',
    description: 'Pricing plans with features and buttons',
    fields: [
      ...heading,
      list('plans', 'Plans', [
        f('name', 'Plan name', 'text', { half: true }),
        f('badge', 'Badge (e.g. Popular)', 'text', { half: true }),
        f('price', 'Price', 'text', { half: true }),
        f('period', 'Period (e.g. /month)', 'text', { half: true }),
        f('description', 'Description', 'textarea'),
        f('features', 'Features (one per line)', 'textarea', { rows: 5 }),
        f('buttonText', 'Button text', 'text', { half: true }),
        f('buttonUrl', 'Button link', 'url', { half: true }),
        f('featured', 'Highlight this plan', 'toggle'),
      ], { name: 'Plan', badge: '', price: '$0', period: '/month', description: '', features: 'Feature one\nFeature two', buttonText: 'Choose', buttonUrl: '#', featured: false }, { itemLabel: 'Plan' }),
    ],
    defaults: {
      eyebrow: 'Pricing', title: 'Simple, transparent pricing', subtitle: 'No hidden fees. Cancel anytime.',
      plans: [
        { name: 'Starter', badge: '', price: '$19', period: '/month', description: 'For individuals getting started.', features: '1 project\nBasic support\nCore features', buttonText: 'Get started', buttonUrl: '#', featured: false },
        { name: 'Pro', badge: 'Most popular', price: '$49', period: '/month', description: 'For growing teams.', features: '10 projects\nPriority support\nAll features\nAnalytics', buttonText: 'Start free trial', buttonUrl: '#', featured: true },
        { name: 'Business', badge: '', price: '$99', period: '/month', description: 'For larger organisations.', features: 'Unlimited projects\nDedicated manager\nSSO & security\nCustom contracts', buttonText: 'Contact sales', buttonUrl: '#', featured: false },
      ],
    },
    defaultStyle: { align: 'center' },
  },

  team: {
    label: 'Team', icon: '👥', category: 'Social proof',
    description: 'People with photos, roles and short bios',
    fields: [
      ...heading, columns('4'),
      list('members', 'Members', [
        f('photo', 'Photo', 'image'),
        f('name', 'Name', 'text', { half: true }),
        f('role', 'Role', 'text', { half: true }),
        f('bio', 'Short bio', 'textarea'),
        f('url', 'Profile link', 'url'),
      ], { photo: '', name: 'Name', role: 'Role', bio: '', url: '' }, { itemLabel: 'Member' }),
    ],
    defaults: {
      eyebrow: 'Our team', title: 'Meet the people behind it', subtitle: '', columns: '4',
      members: [1, 2, 3, 4].map((i) => ({ photo: pic(`sf-team${i}`, 600, 600), name: ['Alex Morgan', 'Jamie Lee', 'Sam Patel', 'Taylor Kim'][i - 1], role: ['Founder', 'Design Lead', 'Engineer', 'Customer Success'][i - 1], bio: '', url: '' })),
    },
    defaultStyle: { align: 'center' },
  },

  logos: {
    label: 'Logo strip', icon: '🏷️', category: 'Social proof',
    description: 'Client or partner logos',
    fields: [
      f('title', 'Title'),
      f('height', 'Logo height (px)', 'number', { half: true }),
      f('grayscale', 'Grayscale until hovered', 'toggle'),
      list('items', 'Logos', [f('image', 'Logo', 'image'), f('name', 'Name (alt text)', 'text', { half: true }), f('url', 'Link', 'url', { half: true })], { image: '', name: '', url: '' }, { itemLabel: 'Logo' }),
    ],
    defaults: { title: 'Trusted by great companies', height: 36, grayscale: true, items: [] },
    defaultStyle: { align: 'center', paddingTop: 48, paddingBottom: 48 },
  },

  gallery: {
    label: 'Gallery', icon: '🖼', category: 'Media',
    description: 'Image grid with optional lightbox',
    fields: [
      ...heading, columns('3'),
      f('aspect', 'Image shape', 'select', { half: true, options: [{ value: 'auto', label: 'Original' }, { value: '1-1', label: 'Square' }, { value: '4-3', label: '4:3' }, { value: '16-9', label: '16:9' }, { value: '3-4', label: 'Portrait 3:4' }] }),
      f('lightbox', 'Open images in a lightbox', 'toggle'),
      list('items', 'Images', [f('image', 'Image', 'image'), f('caption', 'Caption', 'text', { half: true }), f('url', 'Link (optional)', 'url', { half: true })], { image: '', caption: '', url: '' }, { itemLabel: 'Image' }),
    ],
    defaults: {
      eyebrow: '', title: 'Gallery', subtitle: '', columns: '3', aspect: '4-3', lightbox: true,
      items: [1, 2, 3, 4, 5, 6].map((i) => ({ image: pic(`sf-gal${i}`, 1200, 900), caption: '', url: '' })),
    },
    defaultStyle: { align: 'center' },
  },

  video: {
    label: 'Video', icon: '🎬', category: 'Media',
    description: 'YouTube, Vimeo or an uploaded video file',
    fields: [...heading, f('url', 'Video URL', 'url', { help: 'YouTube or Vimeo link, or an uploaded .mp4' }), f('caption', 'Caption'), f('autoplay', 'Autoplay (muted)', 'toggle')],
    defaults: { eyebrow: '', title: '', subtitle: '', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', caption: '', autoplay: false },
    defaultStyle: { align: 'center', width: 'narrow' },
  },

  faq: {
    label: 'FAQ', icon: '❓', category: 'Content',
    description: 'Expandable questions and answers',
    fields: [...heading, list('items', 'Questions', [f('question', 'Question'), f('answer', 'Answer', 'textarea', { rows: 4 })], { question: 'Question?', answer: 'Answer.' }, { itemLabel: 'Question' })],
    defaults: {
      eyebrow: 'FAQ', title: 'Frequently asked questions', subtitle: '',
      items: [
        { question: 'How long does it take?', answer: 'Most projects are completed within two to four weeks.' },
        { question: 'How much does it cost?', answer: 'Pricing depends on your needs. Contact us for a free quote.' },
        { question: 'Do you offer support?', answer: 'Yes — every plan includes ongoing support.' },
      ],
    },
    defaultStyle: { align: 'center' },
  },

  cta: {
    label: 'Call to action', icon: '📣', category: 'Intro',
    description: 'A bold banner that asks visitors to act',
    fields: [
      f('title', 'Title'), f('text', 'Text', 'textarea'),
      f('primaryText', 'Primary button', 'text', { half: true }), f('primaryUrl', 'Primary button link', 'url', { half: true }),
      f('secondaryText', 'Secondary button', 'text', { half: true }), f('secondaryUrl', 'Secondary button link', 'url', { half: true }),
      f('layout', 'Layout', 'select', { options: [{ value: 'stacked', label: 'Stacked' }, { value: 'inline', label: 'Text left, buttons right' }] }),
    ],
    defaults: { title: 'Ready to get started?', text: 'Join hundreds of happy customers today.', primaryText: 'Contact us', primaryUrl: '#contact', secondaryText: '', secondaryUrl: '', layout: 'stacked' },
    defaultStyle: { align: 'center', tone: 'primary' },
  },

  contact: {
    label: 'Contact & form', icon: '✉️', category: 'Forms',
    description: 'Contact details, map and a form whose entries you see in the admin',
    fields: [
      ...heading,
      f('email', 'Email', 'text', { half: true }), f('phone', 'Phone', 'text', { half: true }),
      f('address', 'Address', 'textarea', { half: true }), f('hours', 'Opening hours', 'textarea', { half: true }),
      f('mapEmbed', 'Map embed URL', 'url', { help: 'e.g. https://www.google.com/maps?q=Your+Address&output=embed' }),
      f('showForm', 'Show form', 'toggle'),
      list('formFields', 'Form fields', [
        f('label', 'Label', 'text', { half: true }),
        f('name', 'Field name', 'text', { half: true, help: 'Optional, generated from the label' }),
        f('type', 'Type', 'select', { half: true, options: ['text', 'email', 'tel', 'number', 'date', 'textarea', 'select', 'checkbox'] }),
        f('width', 'Width', 'select', { half: true, options: ['full', 'half'] }),
        f('options', 'Options for select (comma separated)'),
        f('placeholder', 'Placeholder'),
        f('required', 'Required', 'toggle'),
      ], { label: 'Field', name: '', type: 'text', width: 'full', options: '', placeholder: '', required: false }, { itemLabel: 'Field' }),
      f('submitText', 'Submit button text', 'text', { half: true }),
      f('successMessage', 'Success message', 'text', { half: true }),
      f('action', 'Custom form action URL', 'url', { help: 'Leave empty to collect entries in this admin panel.' }),
    ],
    defaults: {
      eyebrow: 'Contact', title: 'Get in touch', subtitle: "Send us a message and we'll get back to you within one business day.",
      email: 'hello@example.com', phone: '+1 (555) 010-2030', address: '123 Main Street\nSpringfield', hours: '', mapEmbed: '',
      showForm: true,
      formFields: [
        { label: 'Name', name: 'name', type: 'text', width: 'half', options: '', placeholder: '', required: true },
        { label: 'Email', name: 'email', type: 'email', width: 'half', options: '', placeholder: '', required: true },
        { label: 'Message', name: 'message', type: 'textarea', width: 'full', options: '', placeholder: '', required: true },
      ],
      submitText: 'Send message', successMessage: "Thanks! We'll be in touch soon.", action: '',
    },
  },

  html: {
    label: 'Custom HTML', icon: '</>', category: 'Advanced',
    description: 'Paste any HTML, embed or widget',
    fields: [f('html', 'HTML', 'code', { rows: 12 }), f('container', 'Keep inside the content width', 'toggle')],
    defaults: { html: '<div style="text-align:center">\n  <h2>Custom HTML</h2>\n  <p>Paste embeds, widgets or your own markup.</p>\n</div>', container: true },
  },

  spacer: {
    label: 'Spacer / divider', icon: '↕', category: 'Advanced',
    description: 'Empty space with an optional line',
    fields: [f('height', 'Height (px)', 'number'), f('divider', 'Show a divider line', 'toggle')],
    defaults: { height: 48, divider: false },
    defaultStyle: { paddingTop: 0, paddingBottom: 0 },
  },
};

export { SECTION_TYPES };

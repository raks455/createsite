// Google Fonts offered in the font picker, with the weights each one supports.
// Any other Google font name also works (loaded at its default weight).
const GOOGLE_FONTS = {
  'Inter': '400;500;600;700;800',
  'Roboto': '400;500;700;900',
  'Open Sans': '400;500;600;700;800',
  'Lato': '400;700;900',
  'Montserrat': '400;500;600;700;800',
  'Poppins': '400;500;600;700;800',
  'Raleway': '400;500;600;700;800',
  'Nunito': '400;500;600;700;800',
  'Manrope': '400;500;600;700;800',
  'Plus Jakarta Sans': '400;500;600;700;800',
  'DM Sans': '400;500;600;700;800',
  'Outfit': '400;500;600;700;800',
  'Sora': '400;500;600;700;800',
  'Figtree': '400;500;600;700;800',
  'Work Sans': '400;500;600;700;800',
  'Rubik': '400;500;600;700;800',
  'Archivo': '400;500;600;700;800',
  'Space Grotesk': '400;500;600;700',
  'IBM Plex Sans': '400;500;600;700',
  'Source Sans 3': '400;600;700;800',
  'Josefin Sans': '400;600;700',
  'Syne': '400;500;600;700;800',
  'Oswald': '400;500;600;700',
  'Bebas Neue': '400',
  'Playfair Display': '400;500;600;700;800',
  'Merriweather': '400;700;900',
  'Lora': '400;500;600;700',
  'Fraunces': '400;600;700;800',
  'DM Serif Display': '400',
  'Cormorant Garamond': '400;500;600;700',
  'Libre Baskerville': '400;700',
};

const SYSTEM_FONTS = ['system-ui', 'Georgia', 'Arial', 'Helvetica', 'Times New Roman', 'Verdana', 'Courier New', 'sans-serif', 'serif', 'monospace'];
const SERIF = /serif|garamond|baskerville|playfair|lora|merriweather|fraunces|georgia|times/i;

const clean = (n) => String(n || '').replace(/[^\w \-]/g, '').trim();

function fontStack(name) {
  const n = clean(name) || 'system-ui';
  const fallback = SERIF.test(n) && !/sans/i.test(n) ? 'Georgia, serif' : 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  if (['sans-serif', 'serif', 'monospace', 'system-ui'].includes(n)) return `${n}, ${fallback}`;
  return `"${n}", ${fallback}`;
}

function fontLinks(names: string[]): string {
  const families: string[] = [...new Set<string>(names.map(clean).filter((n) => n && !SYSTEM_FONTS.includes(n)))];
  if (!families.length) return '';
  const query = families.map((f) => `family=${f.replace(/ /g, '+')}${GOOGLE_FONTS[f] ? `:wght@${GOOGLE_FONTS[f]}` : ''}`).join('&');
  return `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?${query}&display=swap">`;
}

const FONT_LIST = [...Object.keys(GOOGLE_FONTS), ...SYSTEM_FONTS.slice(0, 6)];

export { fontStack, fontLinks, FONT_LIST };

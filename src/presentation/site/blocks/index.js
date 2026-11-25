'use strict';
// One renderer per section type (keys match domain/content/sectionTypes.js).
// render(data, helpers, section) returns the HTML inside the section container.
// Optional: style(data) adds inline CSS to the <section>; bare(data) skips the container.

const lines = (text) => String(text || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const slugName = (s, i) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || `field_${i + 1}`;
const arr = (v) => (Array.isArray(v) ? v : []);

function videoEmbed(url, autoplay, esc) {
  const v = String(url || '').trim();
  let m;
  if ((m = v.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/))) {
    return `<iframe src="https://www.youtube-nocookie.com/embed/${m[1]}${autoplay ? '?autoplay=1&mute=1' : ''}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy" title="Video"></iframe>`;
  }
  if ((m = v.match(/vimeo\.com\/(?:video\/)?(\d+)/))) {
    return `<iframe src="https://player.vimeo.com/video/${m[1]}${autoplay ? '?autoplay=1&muted=1' : ''}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy" title="Video"></iframe>`;
  }
  return v ? `<video src="${esc(v)}" controls playsinline${autoplay ? ' autoplay muted loop' : ''}></video>` : '';
}

const RENDERERS = {
  hero: {
    style: (d) => (Number(d.minHeight) > 0 ? `min-height:${Math.min(Number(d.minHeight), 100)}vh` : ''),
    render(d, u) {
      const text = `${u.eyebrow(d.eyebrow)}<h1>${u.esc(d.title)}</h1>${d.subtitle ? `<p class="lead">${u.nl(d.subtitle)}</p>` : ''}`
        + u.btns([d.primaryText, d.primaryUrl], [d.secondaryText, d.secondaryUrl, 'outline']);
      if (d.layout === 'split') return `<div class="hero-split"><div class="hero-text">${text}</div><div class="hero-img">${u.img(d.image, d.title)}</div></div>`;
      return `<div class="hero-text">${text}</div>${d.image ? `<div class="hero-below">${u.img(d.image, d.title)}</div>` : ''}`;
    },
  },

  text: {
    render: (d, u) => `${d.title ? `<h2>${u.esc(d.title)}</h2>` : ''}<div class="prose">${d.content || ''}</div>`,
  },

  imageText: {
    render: (d, u) => `<div class="split${d.imagePosition === 'right' ? ' img-right' : ''}">`
      + `<div class="split-media">${u.img(d.image, d.title)}</div>`
      + `<div class="split-text">${u.eyebrow(d.eyebrow)}${d.title ? `<h2>${u.esc(d.title)}</h2>` : ''}<div class="prose">${d.content || ''}</div>${u.btns([d.buttonText, d.buttonUrl])}</div></div>`,
  },

  columns: {
    render: (d, u) => `${u.head(d)}<div class="grid ${u.cols(d.columns)}">${arr(d.items).map((it) => `<div class="prose">${it.content || ''}</div>`).join('')}</div>`,
  },

  features: {
    render: (d, u) => `${u.head(d)}<div class="grid ${u.cols(d.columns)}">${arr(d.items).map((it) => {
      const media = it.image ? `<div class="card-media">${u.img(it.image, it.title)}</div>` : it.icon ? `<div class="icon">${u.esc(it.icon)}</div>` : '';
      return `<div class="card st-${u.esc(d.cardStyle || 'raised')}">${media}${it.title ? `<h3>${u.esc(it.title)}</h3>` : ''}`
        + `${it.text ? `<p class="muted">${u.nl(it.text)}</p>` : ''}${it.linkText ? `<a class="more" href="${u.url(it.linkUrl)}">${u.esc(it.linkText)} →</a>` : ''}</div>`;
    }).join('')}</div>`,
  },

  steps: {
    render: (d, u) => `${u.head(d)}<div class="grid ${u.cols(d.columns)}">${arr(d.items).map((it, i) =>
      `<div class="step"><div class="step-num">${i + 1}</div><h3>${u.esc(it.title)}</h3>${it.text ? `<p class="muted">${u.nl(it.text)}</p>` : ''}</div>`).join('')}</div>`,
  },

  stats: {
    render: (d, u) => `${u.head(d)}<div class="grid ${u.cols(d.columns)}">${arr(d.items).map((it) =>
      `<div class="stat"><div class="stat-val">${u.esc(it.value)}</div><div class="muted">${u.esc(it.label)}</div></div>`).join('')}</div>`,
  },

  testimonials: {
    render: (d, u) => `${u.head(d)}<div class="grid ${u.cols(d.columns)}">${arr(d.items).map((it) => {
      const r = Math.max(0, Math.min(5, parseInt(it.rating, 10) || 0));
      return `<figure class="card st-raised quote">${r ? `<div class="stars" aria-label="${r} out of 5">${'★'.repeat(r)}${'☆'.repeat(5 - r)}</div>` : ''}`
        + `<blockquote>“${u.nl(it.quote)}”</blockquote><figcaption class="who">${u.img(it.avatar, it.name, 'avatar')}`
        + `<div><b>${u.esc(it.name)}</b>${it.role ? `<span class="muted">${u.esc(it.role)}</span>` : ''}</div></figcaption></figure>`;
    }).join('')}</div>`,
  },

  pricing: {
    render: (d, u) => {
      const plans = arr(d.plans);
      return `${u.head(d)}<div class="grid ${u.cols(plans.length || 1)} pricing">${plans.map((p) =>
        `<div class="card st-raised plan${p.featured ? ' featured' : ''}">${p.badge ? `<span class="badge">${u.esc(p.badge)}</span>` : ''}`
        + `<h3>${u.esc(p.name)}</h3><div class="price"><span class="amt">${u.esc(p.price)}</span><span class="muted">${u.esc(p.period)}</span></div>`
        + `${p.description ? `<p class="muted">${u.nl(p.description)}</p>` : ''}<ul class="checks">${lines(p.features).map((l) => `<li>${u.esc(l)}</li>`).join('')}</ul>`
        + `${u.btn(p.buttonText, p.buttonUrl, p.featured ? '' : 'outline')}</div>`).join('')}</div>`;
    },
  },

  team: {
    render: (d, u) => `${u.head(d)}<div class="grid ${u.cols(d.columns)}">${arr(d.members).map((m) =>
      `<div class="member">${u.img(m.photo, m.name, 'photo')}<h3>${m.url ? `<a href="${u.url(m.url)}">${u.esc(m.name)}</a>` : u.esc(m.name)}</h3>`
      + `${m.role ? `<div class="role">${u.esc(m.role)}</div>` : ''}${m.bio ? `<p class="muted">${u.nl(m.bio)}</p>` : ''}</div>`).join('')}</div>`,
  },

  logos: {
    render: (d, u) => `${d.title ? `<p class="logo-title">${u.esc(d.title)}</p>` : ''}<div class="logos${d.grayscale ? ' gray' : ''}" style="--lg-h:${Number(d.height) || 36}px">`
      + arr(d.items).map((it) => {
        const image = it.image ? u.img(it.image, it.name) : `<strong>${u.esc(it.name)}</strong>`;
        return it.url ? `<a href="${u.url(it.url)}" target="_blank" rel="noopener">${image}</a>` : image;
      }).join('') + '</div>',
  },

  gallery: {
    render: (d, u) => `${u.head(d)}<div class="grid ${u.cols(d.columns)} gallery ar-${u.esc(d.aspect || 'auto')}">${arr(d.items).map((it) => {
      const image = u.img(it.image, it.caption);
      const inner = it.url ? `<a href="${u.url(it.url)}">${image}</a>` : d.lightbox && it.image ? `<a href="${u.esc(it.image)}" data-lb>${image}</a>` : image;
      return `<figure>${inner}${it.caption ? `<figcaption>${u.esc(it.caption)}</figcaption>` : ''}</figure>`;
    }).join('')}</div>`,
  },

  video: {
    render: (d, u) => `${u.head(d)}<div class="video">${videoEmbed(d.url, d.autoplay, u.esc)}</div>${d.caption ? `<p class="caption">${u.esc(d.caption)}</p>` : ''}`,
  },

  faq: {
    render: (d, u) => `${u.head(d)}<div class="faq">${arr(d.items).map((it) =>
      `<details class="faq-item"><summary>${u.esc(it.question)}</summary><div class="faq-a muted">${u.nl(it.answer)}</div></details>`).join('')}</div>`,
  },

  cta: {
    render: (d, u) => {
      const text = `<h2>${u.esc(d.title)}</h2>${d.text ? `<p class="lead">${u.nl(d.text)}</p>` : ''}`;
      const buttons = u.btns([d.primaryText, d.primaryUrl], [d.secondaryText, d.secondaryUrl, 'outline']);
      return d.layout === 'inline' ? `<div class="cta-inline"><div>${text}</div>${buttons}</div>` : text + buttons;
    },
  },

  contact: {
    render(d, u, section) {
      const info = [
        ['Email', d.email && `<a href="mailto:${u.esc(d.email)}">${u.esc(d.email)}</a>`],
        ['Phone', d.phone && `<a href="tel:${u.esc(String(d.phone).replace(/[^\d+]/g, ''))}">${u.esc(d.phone)}</a>`],
        ['Address', d.address && u.nl(d.address)],
        ['Hours', d.hours && u.nl(d.hours)],
      ].filter(([, v]) => v).map(([k, v]) => `<div class="info-item"><b>${k}</b>${v}</div>`).join('');
      const map = d.mapEmbed ? `<div class="map"><iframe src="${u.esc(d.mapEmbed)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Map"></iframe></div>` : '';
      const left = `${u.head(d)}${info ? `<div class="info-list">${info}</div>` : ''}${map}`;
      if (!d.showForm) return `<div class="contact-grid single">${left}</div>`;

      const builtIn = !d.action;
      const action = d.action || (u.mode === 'export' ? u.settings.general.formEndpoint : `${u.base}/__form`) || '#';
      const fields = arr(d.formFields).map((fd, i) => {
        const name = u.esc(slugName(fd.name || fd.label, i));
        const req = fd.required ? ' required' : '';
        const ph = fd.placeholder ? ` placeholder="${u.esc(fd.placeholder)}"` : '';
        const label = `${u.esc(fd.label)}${fd.required ? ' *' : ''}`;
        const cls = `ff${fd.width === 'half' ? ' half' : ''}`;
        if (fd.type === 'checkbox') return `<label class="${cls} check"><input type="checkbox" name="${name}" value="yes"${req}> ${label}</label>`;
        let input;
        if (fd.type === 'textarea') input = `<textarea name="${name}"${req}${ph}></textarea>`;
        else if (fd.type === 'select') input = `<select name="${name}"${req}><option value="">Choose…</option>${String(fd.options || '').split(',').map((o) => o.trim()).filter(Boolean).map((o) => `<option>${u.esc(o)}</option>`).join('')}</select>`;
        else input = `<input type="${u.esc(fd.type || 'text')}" name="${name}"${req}${ph}>`;
        return `<label class="${cls}"><span>${label}</span>${input}</label>`;
      }).join('');
      const form = `<form class="cs-form card st-raised" method="post" action="${u.esc(action)}"${builtIn && u.mode !== 'export' ? ' data-ajax' : ''}>`
        + `<input type="hidden" name="_page" value="${u.esc(u.page.id)}"><input type="hidden" name="_block" value="${u.esc(section.id)}">`
        + `<input type="text" name="_hp" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">`
        + `<div class="fields">${fields}</div><button class="btn" type="submit">${u.esc(d.submitText || 'Send')}</button>`
        + `<div class="form-msg" hidden>${u.esc(d.successMessage || 'Thank you!')}</div></form>`;
      return `<div class="contact-grid"><div>${left}</div>${form}</div>`;
    },
  },

  html: {
    bare: (d) => !d.container,
    render: (d) => String(d.html || ''),
  },

  spacer: {
    render: (d) => `<div class="spacer" style="height:${Math.max(0, Number(d.height) || 0)}px">${d.divider ? '<hr>' : ''}</div>`,
  },
};

module.exports = { RENDERERS };

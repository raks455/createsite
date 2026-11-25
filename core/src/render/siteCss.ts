// Base stylesheet for every generated site (inlined into each page).
export const BASE_CSS = `*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{margin:0;font-family:var(--font-body);font-size:var(--fs);line-height:var(--lh);color:var(--text);background:var(--bg);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
img,video{max-width:100%;height:auto;display:block}
iframe{max-width:100%}
a{color:var(--primary);text-underline-offset:3px}
h1,h2,h3,h4,h5{font-family:var(--font-heading);font-weight:var(--hw);line-height:1.15;letter-spacing:var(--hls);color:var(--heading);margin:0 0 .5em}
h1{font-size:clamp(2.2rem,1.3rem + 3.6vw,var(--h1))}
h2{font-size:clamp(1.75rem,1.2rem + 2.2vw,var(--h2))}
h3{font-size:1.25rem;letter-spacing:normal}
p{margin:0 0 1em}
p:last-child{margin-bottom:0}
.container{width:100%;max-width:var(--container);margin:0 auto;padding:0 24px}
.w-narrow>.container{max-width:800px}
.w-wide>.container{max-width:1440px}
.w-full>.container{max-width:none}
.w-edge>.container{max-width:none;padding:0}

/* Sections */
.sec{position:relative;padding:var(--sec-pad) 0;color:var(--text);background-size:cover;background-position:center}
.has-bgimg::before{content:"";position:absolute;inset:0;background:#000;opacity:var(--ov,0);pointer-events:none}
.sec>.container{position:relative}
.a-center{text-align:center}.a-right{text-align:right}
.tone-surface{background-color:var(--surface);--card:var(--bg)}
.tone-primary{background-color:var(--primary);--text:var(--on-primary);--heading:var(--on-primary);--muted:color-mix(in srgb,var(--on-primary) 82%,transparent);--card:color-mix(in srgb,var(--on-primary) 10%,transparent);--border:color-mix(in srgb,var(--on-primary) 28%,transparent)}
.tone-primary .btn{background:var(--on-primary);color:var(--primary);border-color:var(--on-primary)}
.tone-primary .btn-outline{background:transparent;color:var(--on-primary)}
.tone-primary a:not(.btn){color:inherit}
.tone-primary .eyebrow{color:var(--on-primary);opacity:.85}
.tone-dark{background-color:#0c111d;--text:#d4d9e3;--heading:#fff;--muted:#98a2b3;--card:#161d2c;--surface:#161d2c;--border:#283247}
.tone-dark .btn-outline{color:#fff}
.has-text-color .btn-outline{color:var(--text)}
.sec-head{max-width:720px;margin:0 0 clamp(32px,5vw,56px)}
.a-center .sec-head{margin-left:auto;margin-right:auto}
.a-right .sec-head{margin-left:auto}
.sec-head p,.muted{color:var(--muted)}
.lead{font-size:clamp(1.05rem,1rem + .4vw,1.25rem);color:var(--muted);max-width:660px}
.a-center .lead{margin-left:auto;margin-right:auto}
.eyebrow{display:inline-block;font-size:.78rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--primary);margin-bottom:14px}
.has-text-color .eyebrow{color:inherit;opacity:.85}

/* Buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:.8em 1.6em;border-radius:var(--btn-radius);background:var(--primary);color:var(--on-primary);border:2px solid var(--primary);font:inherit;font-weight:600;font-size:1rem;line-height:1.2;text-decoration:none;text-transform:var(--btn-tt);letter-spacing:var(--btn-ls);cursor:pointer;transition:transform .15s,filter .15s,background .15s}
.btn:hover{filter:brightness(1.08);transform:translateY(-1px)}
.btn-outline{background:transparent;color:var(--heading);border-color:color-mix(in srgb,currentColor 35%,transparent)}
.btn-outline:hover{border-color:currentColor}
.btns{display:flex;flex-wrap:wrap;gap:12px;margin-top:32px}
.a-center .btns{justify-content:center}.a-right .btns{justify-content:flex-end}

/* Grid & cards */
.grid{display:grid;gap:28px}
.c1{grid-template-columns:1fr}.c2{grid-template-columns:repeat(2,minmax(0,1fr))}.c3{grid-template-columns:repeat(3,minmax(0,1fr))}.c4{grid-template-columns:repeat(4,minmax(0,1fr))}
@media(max-width:960px){.c3,.c4{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:620px){.c2,.c3,.c4{grid-template-columns:1fr}}
.card{border-radius:var(--radius);position:relative}
.st-raised{background:var(--card);padding:32px;box-shadow:var(--shadow);border:1px solid var(--border)}
.st-bordered{border:1px solid var(--border);padding:32px}
.st-plain{padding:0}
.card-media{margin:-32px -32px 24px;overflow:hidden;border-radius:var(--radius) var(--radius) 0 0}
.st-plain .card-media{margin:0 0 20px;border-radius:var(--radius)}
.card-media img{width:100%;aspect-ratio:16/10;object-fit:cover}
.icon{width:56px;height:56px;border-radius:calc(var(--radius)*.8);background:color-mix(in srgb,var(--primary) 12%,transparent);display:flex;align-items:center;justify-content:center;font-size:1.6rem;margin-bottom:20px}
.a-center .icon{margin-left:auto;margin-right:auto}
.more{display:inline-block;margin-top:14px;font-weight:600;text-decoration:none}
.prose>*:first-child{margin-top:0}
.prose h2,.prose h3{margin-top:1.4em}
.prose ul,.prose ol{padding-left:1.3em;margin:0 0 1em}
.prose li{margin-bottom:.35em}
.prose img{border-radius:var(--radius);margin:1.5em 0}
.prose blockquote{border-left:3px solid var(--primary);margin:1.5em 0;padding:.2em 0 .2em 1.2em;font-size:1.1em;color:var(--heading)}
.a-center .prose ul,.a-center .prose ol{display:inline-block;text-align:left}

/* Header */
.announce{background:var(--ann-bg);color:var(--ann-text);text-align:center;font-size:.9rem;padding:9px 16px;position:relative;z-index:51}
.announce a{color:inherit;font-weight:600}
.site-header{position:relative;z-index:50;background:var(--hdr-bg);color:var(--hdr-text);border-bottom:1px solid color-mix(in srgb,var(--hdr-text) 10%,transparent)}
.site-header.sticky{position:sticky;top:0}
.site-header.transparent{position:absolute;left:0;right:0;background:transparent;border-color:transparent;color:var(--hdr-ttext)}
.site-header.transparent.sticky{position:fixed;top:0;transition:background .25s,box-shadow .25s,color .25s}
.site-header.transparent.scrolled{background:var(--hdr-bg);color:var(--hdr-text);box-shadow:0 2px 24px rgba(0,0,0,.08)}
.has-transparent-header main>.sec:first-child{padding-top:calc(var(--sec-pad) + var(--hdr-h))}
.hdr-inner{display:flex;align-items:center;gap:24px;min-height:var(--hdr-h)}
.logo{display:inline-flex;align-items:center;gap:10px;color:inherit;text-decoration:none;font-family:var(--font-heading);font-weight:800;font-size:1.3rem;letter-spacing:-.01em;flex-shrink:0}
.logo img{height:var(--logo-h);width:auto}
.nav-wrap{display:flex;align-items:center;gap:8px;margin-left:auto}
.nav{display:flex;align-items:center;gap:2px}
.nav a{display:block;color:inherit;text-decoration:none;padding:8px 14px;border-radius:8px;font-weight:500;font-size:.97rem;opacity:.85;transition:.15s}
.nav a:hover,.nav a.active{opacity:1;background:color-mix(in srgb,currentColor 8%,transparent)}
.dd{position:relative}
.dd-menu{position:absolute;top:100%;left:0;min-width:210px;padding:8px;background:var(--hdr-bg);color:var(--hdr-text);border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.14);display:none;flex-direction:column}
.dd:hover>.dd-menu,.dd:focus-within>.dd-menu{display:flex}
.caret{font-size:.7em;opacity:.7}
.hdr-cta{margin-left:8px;padding:.6em 1.25em;font-size:.95rem}
.nav-toggle{position:absolute;opacity:0;pointer-events:none}
.burger{display:none;margin-left:auto;width:44px;height:44px;align-items:center;justify-content:center;cursor:pointer;border-radius:8px}
.burger span,.burger span::before,.burger span::after{display:block;width:22px;height:2px;background:currentColor;border-radius:2px;position:relative;transition:.2s}
.burger span::before,.burger span::after{content:"";position:absolute;left:0}
.burger span::before{top:-7px}.burger span::after{top:7px}
.nav-toggle:checked+.burger span{background:transparent}
.nav-toggle:checked+.burger span::before{top:0;transform:rotate(45deg)}
.nav-toggle:checked+.burger span::after{top:0;transform:rotate(-45deg)}
.hdr-centered .hdr-inner{flex-direction:column;justify-content:center;gap:6px;padding-top:16px;padding-bottom:12px}
.hdr-centered .nav-wrap{margin:0}
.hdr-minimal .burger{display:flex}
.hdr-minimal .nav-wrap{display:none;position:absolute;top:100%;left:0;right:0;flex-direction:column;align-items:stretch;gap:4px;padding:12px 24px 24px;background:var(--hdr-bg);color:var(--hdr-text);box-shadow:0 16px 30px rgba(0,0,0,.12);margin:0}
.hdr-minimal .nav-toggle:checked~.nav-wrap{display:flex}
.hdr-minimal .nav{flex-direction:column;align-items:stretch}
.hdr-minimal .dd-menu{position:static;display:flex;box-shadow:none;padding:0 0 0 14px;background:transparent}
.hdr-minimal .hdr-cta{margin:8px 0 0}
@media(max-width:860px){
  .site-header .burger{display:flex}
  .hdr-centered .hdr-inner{flex-direction:row;padding-top:0;padding-bottom:0}
  .site-header .nav-wrap{display:none;position:absolute;top:100%;left:0;right:0;flex-direction:column;align-items:stretch;gap:4px;padding:12px 24px 24px;background:var(--hdr-bg);color:var(--hdr-text);box-shadow:0 16px 30px rgba(0,0,0,.12);margin:0}
  .site-header .nav-toggle:checked~.nav-wrap{display:flex}
  .site-header .nav{flex-direction:column;align-items:stretch}
  .site-header .dd-menu{position:static;display:flex;box-shadow:none;padding:0 0 0 14px;background:transparent}
  .site-header .hdr-cta{margin:8px 0 0}
}

/* Footer */
.site-footer{background:var(--ftr-bg);color:var(--ftr-text);padding:72px 0 28px;font-size:.95rem}
.site-footer a{color:inherit;text-decoration:none;opacity:.8}
.site-footer a:hover{opacity:1}
.site-footer .logo{color:#fff;opacity:1;margin-bottom:14px}
.ftr-grid{display:flex;flex-wrap:wrap;gap:40px 64px;margin-bottom:48px}
.ftr-about{flex:2 1 280px;max-width:420px}
.ftr-col{flex:0 1 170px}
.ftr-col h4{font-family:var(--font-body);font-size:.8rem;text-transform:uppercase;letter-spacing:.12em;color:inherit;margin-bottom:16px;font-weight:700}
.ftr-col a{display:block;padding:5px 0}
.ftr-bottom{display:flex;flex-wrap:wrap;gap:16px;justify-content:space-between;align-items:center;padding-top:24px;border-top:1px solid color-mix(in srgb,currentColor 15%,transparent)}
.ftr-simple{padding:28px 0}
.ftr-simple .ftr-bottom{border:0;padding:0}
.socials{display:flex;flex-wrap:wrap;gap:8px}
.site-footer .soc{border:1px solid color-mix(in srgb,currentColor 25%,transparent);padding:6px 14px;border-radius:999px;font-size:.85rem}

/* Hero */
.sec-hero{display:flex;align-items:center}
.sec-hero>.container{width:100%}
.hero-split{display:grid;grid-template-columns:1.05fr 1fr;gap:clamp(32px,5vw,72px);align-items:center;text-align:left}
.hero-split .btns{justify-content:flex-start}
.hero-split .lead{margin-left:0}
.hero-img img,.hero-below img{width:100%;border-radius:var(--radius);box-shadow:var(--shadow)}
.hero-below{margin-top:clamp(40px,6vw,72px)}

/* Image + text */
.split{display:grid;grid-template-columns:1fr 1fr;gap:clamp(32px,6vw,80px);align-items:center}
.split.img-right .split-media{order:2}
.split-media img{width:100%;border-radius:var(--radius);box-shadow:var(--shadow);object-fit:cover}
@media(max-width:860px){.hero-split,.split{grid-template-columns:1fr}.split.img-right .split-media{order:0}}

/* Gallery */
.gallery figure{margin:0}
.gallery img{width:100%;border-radius:var(--radius);object-fit:cover;transition:transform .35s}
.gallery a{display:block;overflow:hidden;border-radius:var(--radius)}
.gallery a:hover img{transform:scale(1.04)}
.gallery figcaption{font-size:.92rem;margin-top:10px;color:var(--muted)}
.ar-1-1 img{aspect-ratio:1/1}.ar-4-3 img{aspect-ratio:4/3}.ar-16-9 img{aspect-ratio:16/9}.ar-3-4 img{aspect-ratio:3/4}

/* Testimonials */
.quote{margin:0;display:flex;flex-direction:column;gap:18px;text-align:left}
.quote blockquote{margin:0;font-size:1.05rem;color:var(--heading)}
.stars{color:#f59e0b;letter-spacing:2px}
.who{display:flex;align-items:center;gap:12px;margin-top:auto}
.who b{display:block;color:var(--heading)}
.who span{font-size:.9rem}
.avatar{width:46px;height:46px;border-radius:50%;object-fit:cover}

/* Pricing */
.pricing{align-items:stretch}
.plan{display:flex;flex-direction:column;text-align:left}
.plan.featured{border:2px solid var(--primary)}
@media(min-width:961px){.plan.featured{transform:translateY(-10px)}}
.badge{position:absolute;top:-13px;left:32px;background:var(--primary);color:var(--on-primary);font-size:.72rem;font-weight:700;padding:4px 12px;border-radius:999px;text-transform:uppercase;letter-spacing:.06em}
.price{display:flex;align-items:baseline;gap:6px;margin:8px 0 12px}
.amt{font-size:2.6rem;font-weight:800;color:var(--heading);font-family:var(--font-heading);letter-spacing:-.02em}
.checks{list-style:none;padding:0;margin:20px 0 28px;display:grid;gap:10px;flex:1;align-content:start}
.checks li{padding-left:28px;position:relative}
.checks li::before{content:"✓";position:absolute;left:0;color:var(--primary);font-weight:800}
.plan .btn{width:100%}

/* Stats, steps, team, logos */
.stat-val{font-family:var(--font-heading);font-size:clamp(2.2rem,1.5rem + 2.5vw,3.4rem);font-weight:800;color:var(--heading);line-height:1.1;letter-spacing:-.03em;margin-bottom:6px}
.step-num{width:48px;height:48px;border-radius:50%;background:var(--primary);color:var(--on-primary);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.1rem;margin-bottom:18px}
.a-center .step-num{margin-left:auto;margin-right:auto}
.member .photo{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:var(--radius);margin-bottom:18px}
.member h3{margin-bottom:4px}
.member h3 a{color:inherit;text-decoration:none}
.role{color:var(--primary);font-weight:600;font-size:.92rem;margin-bottom:10px}
.logo-title{color:var(--muted);font-weight:600;margin-bottom:28px}
.logos{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:28px 56px}
.a-left .logos{justify-content:flex-start}
.logos img{height:var(--lg-h);width:auto;object-fit:contain}
.logos.gray img{filter:grayscale(1);opacity:.6;transition:.2s}
.logos.gray img:hover{filter:none;opacity:1}

/* FAQ */
.faq{max-width:820px;margin:0 auto;display:grid;gap:12px;text-align:left}
.faq-item{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:0 24px}
.faq-item summary{cursor:pointer;list-style:none;padding:20px 36px 20px 0;font-weight:600;color:var(--heading);position:relative}
.faq-item summary::-webkit-details-marker{display:none}
.faq-item summary::after{content:"+";position:absolute;right:0;top:50%;transform:translateY(-50%);font-size:1.5rem;font-weight:400;color:var(--primary);transition:transform .2s}
.faq-item[open] summary::after{transform:translateY(-50%) rotate(45deg)}
.faq-a{padding:0 0 22px}

/* CTA */
.cta-inline{display:flex;align-items:center;justify-content:space-between;gap:32px;flex-wrap:wrap;text-align:left}
.cta-inline .btns{margin-top:0}
.cta-inline h2{margin-bottom:.25em}

/* Contact & forms */
.contact-grid{display:grid;grid-template-columns:1fr 1.2fr;gap:clamp(32px,5vw,64px);align-items:start;text-align:left}
.contact-grid.single{grid-template-columns:1fr;max-width:720px;margin:0 auto}
@media(max-width:860px){.contact-grid{grid-template-columns:1fr}}
.info-list{display:grid;gap:22px}
.info-item b{display:block;color:var(--heading);margin-bottom:2px;font-size:.8rem;text-transform:uppercase;letter-spacing:.1em}
.info-item a{color:inherit}
.map{margin-top:28px;border-radius:var(--radius);overflow:hidden;aspect-ratio:4/3}
.map iframe{width:100%;height:100%;border:0;display:block}
.cs-form{text-align:left}
.cs-form .fields{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.ff{display:flex;flex-direction:column;gap:6px;grid-column:1/-1;font-size:.92rem;font-weight:600;color:var(--heading)}
.ff.half{grid-column:auto}
.ff.check{flex-direction:row;align-items:center;gap:10px;font-weight:500}
@media(max-width:620px){.ff.half{grid-column:1/-1}}
.ff input,.ff textarea,.ff select{font:inherit;font-weight:400;padding:12px 14px;border:1px solid var(--border);border-radius:calc(var(--radius)*.6);background:var(--bg);color:var(--text);width:100%}
.ff.check input{width:auto}
.ff input:focus,.ff textarea:focus,.ff select:focus{outline:3px solid color-mix(in srgb,var(--primary) 25%,transparent);border-color:var(--primary)}
.ff textarea{min-height:130px;resize:vertical}
.cs-form .btn{margin-top:20px}
.form-msg{padding:16px;border-radius:calc(var(--radius)*.6);background:color-mix(in srgb,var(--primary) 12%,transparent);color:var(--heading);font-weight:600}
.hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}

/* Video, spacer */
.video{position:relative;aspect-ratio:16/9;border-radius:var(--radius);overflow:hidden;background:#000;box-shadow:var(--shadow)}
.video iframe,.video video{position:absolute;inset:0;width:100%;height:100%;border:0}
.caption{margin-top:14px;font-size:.92rem;color:var(--muted)}
.spacer{display:flex;align-items:center}
.spacer hr{flex:1;border:0;border-top:1px solid var(--border);margin:0}

/* Utilities */
.lb{position:fixed;inset:0;background:rgba(0,0,0,.9);display:flex;align-items:center;justify-content:center;z-index:9999;cursor:zoom-out;padding:24px}
.lb img{max-width:100%;max-height:100%;border-radius:8px}
@media(max-width:768px){.hide-m{display:none!important}}
@media(min-width:769px){.hide-d{display:none!important}}
.site-header.sticky:not(.transparent).scrolled{box-shadow:0 1px 0 rgba(16,24,40,.04),0 10px 30px rgba(16,24,40,.07)}

/* ---------- Motion ----------
   JS adds .anim + .anim-<style> to <body> and .rv (reveal) to elements, with
   --i as their stagger index. Elements get .in when they scroll into view and
   .done once the entrance has finished (so hover effects respond instantly). */
.anim .rv{--ease:cubic-bezier(.22,1,.36,1);transition:opacity .9s var(--ease),transform 1s var(--ease),filter .9s var(--ease),clip-path 1.2s var(--ease),box-shadow .3s;transition-delay:calc(var(--i,0) * 90ms)}
.anim .rv.done{transition:opacity .3s,transform .35s var(--ease),filter .3s,box-shadow .35s,clip-path .3s;transition-delay:0s}

/* Minimal: quiet fade */
.anim-minimal .rv:not(.in){opacity:0}

/* Elegant: soft rise with a touch of blur, images unveil, cards lift on hover */
.anim-elegant .rv:not(.in){opacity:0;transform:translateY(26px);filter:blur(6px)}
.anim-elegant .sec-hero h1.rv:not(.in){transform:translateY(18px);letter-spacing:.02em}
.anim-elegant .sec-hero h1.rv{transition-property:opacity,transform,filter,letter-spacing}
.anim-elegant :is(.hero-img,.hero-below,.split-media).rv{transform:none;filter:none}
.anim-elegant :is(.hero-img,.hero-below,.split-media).rv:not(.in){opacity:1;clip-path:inset(12% 10% 12% 10% round var(--radius))}
.anim-elegant :is(.hero-img,.hero-below,.split-media).rv.in{clip-path:inset(0 0 0 0 round 0)}
.anim-elegant :is(.hero-img,.hero-below,.split-media).rv img{transition:transform 1.6s cubic-bezier(.22,1,.36,1)}
.anim-elegant :is(.hero-img,.hero-below,.split-media).rv:not(.in) img{transform:scale(1.12)}
.anim-elegant .card.rv.done:hover{transform:translateY(-6px)}
.anim-elegant .st-raised.rv.done:hover{box-shadow:0 2px 6px rgba(16,24,40,.06),0 24px 48px rgba(16,24,40,.12)}
.anim-elegant .gallery a img{transition:transform .9s cubic-bezier(.22,1,.36,1)}
.anim-elegant .btn{transition:transform .35s cubic-bezier(.22,1,.36,1),filter .2s,box-shadow .35s}
.anim-elegant .btn:hover{box-shadow:0 10px 24px -10px color-mix(in srgb,var(--primary) 70%,transparent)}

/* Expressive: word-by-word headings, scale-in cards, tilt, parallax, cursor */
.anim-expressive .rv:not(.in){opacity:0;transform:translateY(60px) scale(.96)}
.anim-expressive .grid>.rv:not(.in){transform:translateY(80px) rotate(2deg) scale(.92)}
.anim-expressive .rv.rv-split{opacity:1;transform:none;filter:none}
.anim-expressive .w{display:inline-block;overflow:hidden;vertical-align:bottom;padding-bottom:.08em;margin-bottom:-.08em}
.anim-expressive .wi{display:inline-block;transition:transform 1.1s cubic-bezier(.16,1,.3,1),opacity .8s;transition-delay:calc(var(--i,0) * 90ms + var(--w,0) * 55ms)}
.anim-expressive .rv-split:not(.in) .wi{transform:translateY(105%) rotate(6deg);opacity:0}
.anim-expressive :is(.hero-img,.hero-below,.split-media).rv:not(.in){opacity:1;transform:none;clip-path:inset(100% 0 0 0 round var(--radius))}
.anim-expressive :is(.hero-img,.hero-below,.split-media).rv.in{clip-path:inset(0 0 0 0 round var(--radius))}
.anim-expressive .par{will-change:transform}
.anim-expressive .card.rv.done{transform:perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) translateY(var(--ty,0px));transition:transform .5s cubic-bezier(.22,1,.36,1),box-shadow .4s}
.anim-expressive .card.rv.done.tilting{transition:transform .12s linear,box-shadow .4s}
.anim-expressive .card.rv.done:hover{--ty:-8px;box-shadow:0 30px 60px -20px rgba(0,0,0,.3)}
.anim-expressive .gallery a{position:relative}
.anim-expressive .gallery a::after{content:"";position:absolute;inset:0;background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,.35),transparent 70%);transform:translateX(-120%);transition:transform .9s cubic-bezier(.22,1,.36,1);pointer-events:none}
.anim-expressive .gallery a:hover::after{transform:translateX(120%)}
.anim-expressive .gallery a:hover img{transform:scale(1.07) rotate(-.6deg)}
.anim-expressive .btn{transition:transform .3s cubic-bezier(.22,1,.36,1),filter .2s}
.anim-expressive .nav a{position:relative}
.anim-expressive .nav a::after{content:"";position:absolute;left:14px;right:14px;bottom:4px;height:2px;background:currentColor;transform:scaleX(0);transform-origin:right;transition:transform .45s cubic-bezier(.22,1,.36,1)}
.anim-expressive .nav a:hover::after{transform:scaleX(1);transform-origin:left}
.scroll-progress{position:fixed;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--primary),var(--secondary));transform-origin:0 50%;transform:scaleX(0);z-index:9998;pointer-events:none}
.cursor-dot{position:fixed;top:0;left:0;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:#fff;mix-blend-mode:difference;pointer-events:none;z-index:9999;transition:width .3s cubic-bezier(.22,1,.36,1),height .3s cubic-bezier(.22,1,.36,1),margin .3s cubic-bezier(.22,1,.36,1),opacity .3s;opacity:0}
.cursor-dot.on{opacity:1}
.cursor-dot.big{width:56px;height:56px;margin:-28px 0 0 -28px}

@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
`;

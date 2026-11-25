// Small browser scripts inlined into rendered pages (no external requests).

// Runs on every page: sticky header, mobile menu, lightbox, AJAX forms and the
// motion system (body[data-anim] = elegant | expressive | minimal). Motion is
// skipped for visitors who prefer reduced motion.
const SITE_SCRIPT = `(function(){
var hdr=document.querySelector('.site-header.sticky');
if(hdr){var f=function(){hdr.classList.toggle('scrolled',scrollY>10)};addEventListener('scroll',f,{passive:true});f()}
document.querySelectorAll('.nav-wrap a').forEach(function(a){a.addEventListener('click',function(){var t=document.getElementById('nav-toggle');if(t)t.checked=false})});
document.querySelectorAll('.sec').forEach(function(s){s.classList.add('in')});
var B=document.body,style=B.getAttribute('data-anim');
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
if(style&&!reduce&&'IntersectionObserver' in window){
B.classList.add('anim','anim-'+style);
var SEL='.sec-head>*,.sec-hero h1,.sec-hero .eyebrow,.sec-hero .lead,.sec-hero .btns,.hero-img,.hero-below,.split>*,.grid>*,.faq-item,.logo-title,.logos,.cta-inline>*,.contact-grid>*,.prose>*,.video,.caption,.cs-form';
document.querySelectorAll('.sec').forEach(function(sec){var n=0,any=false;
sec.querySelectorAll(SEL).forEach(function(el){if(el.parentElement.closest('.rv'))return;el.classList.add('rv');el.style.setProperty('--i',Math.min(n++,7));any=true});
if(!any){var c=sec.querySelector('.container')||sec.firstElementChild;if(c)c.classList.add('rv')}});
if(style==='expressive'){document.querySelectorAll('.sec h1,.sec h2').forEach(function(h){
var w=0,walk=function(node){Array.prototype.slice.call(node.childNodes).forEach(function(c){
if(c.nodeType===3){var frag=document.createDocumentFragment();c.textContent.split(/(\\s+)/).forEach(function(part){
if(!part)return;if(/^\\s+$/.test(part)){frag.appendChild(document.createTextNode(part));return}
var o=document.createElement('span'),i=document.createElement('span');o.className='w';i.className='wi';i.style.setProperty('--w',w++);i.textContent=part;o.appendChild(i);frag.appendChild(o)});c.parentNode.replaceChild(frag,c)}
else if(c.nodeType===1&&c.tagName!=='BR')walk(c)})};walk(h);h.classList.add('rv-split');if(!h.classList.contains('rv')&&!h.closest('.rv'))h.classList.add('rv')})}
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var el=e.target;io.unobserve(el);el.classList.add('in');
var i=parseFloat(el.style.getPropertyValue('--i'))||0;setTimeout(function(){el.classList.add('done')},1300+i*90)})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
document.querySelectorAll('.rv').forEach(function(el){io.observe(el)});
if(style==='expressive'){
var bar=document.createElement('div');bar.className='scroll-progress';B.appendChild(bar);
var pars=Array.prototype.slice.call(document.querySelectorAll('.hero-img img,.hero-below img,.split-media img'));pars.forEach(function(p){p.classList.add('par')});
var ticking=false,onScroll=function(){if(ticking)return;ticking=true;requestAnimationFrame(function(){ticking=false;
var max=document.documentElement.scrollHeight-innerHeight;bar.style.transform='scaleX('+(max>0?scrollY/max:0)+')';
pars.forEach(function(p){var r=p.parentElement.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;var d=(r.top+r.height/2-innerHeight/2)/innerHeight;p.style.transform='translateY('+(d*-40).toFixed(1)+'px) scale(1.08)'})})};
addEventListener('scroll',onScroll,{passive:true});onScroll();
if(matchMedia('(hover: hover) and (pointer: fine)').matches){
document.querySelectorAll('.grid>.card').forEach(function(c){
c.addEventListener('mousemove',function(e){if(!c.classList.contains('done'))return;var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.classList.add('tilting');c.style.setProperty('--rx',(-y*8).toFixed(2)+'deg');c.style.setProperty('--ry',(x*8).toFixed(2)+'deg')});
c.addEventListener('mouseleave',function(){c.classList.remove('tilting');c.style.setProperty('--rx','0deg');c.style.setProperty('--ry','0deg')})});
document.querySelectorAll('.btn').forEach(function(b){
b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.25).toFixed(1)+'px,'+((e.clientY-r.top-r.height/2)*.35).toFixed(1)+'px)'});
b.addEventListener('mouseleave',function(){b.style.transform=''})});
var dot=document.createElement('div');dot.className='cursor-dot';B.appendChild(dot);var mx=-100,my=-100,cx=-100,cy=-100;
addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;dot.classList.add('on');var t=e.target.closest&&e.target.closest('a,button,label,summary,input,textarea,select');dot.classList.toggle('big',!!t)});
document.addEventListener('mouseleave',function(){dot.classList.remove('on')});
(function loop(){cx+=(mx-cx)*.2;cy+=(my-cy)*.2;dot.style.transform='translate('+cx.toFixed(1)+'px,'+cy.toFixed(1)+'px)';requestAnimationFrame(loop)})()}}}
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[data-lb]');if(!a)return;e.preventDefault();var d=document.createElement('div');d.className='lb';var i=document.createElement('img');i.src=a.href;i.alt='';d.appendChild(i);d.onclick=function(){d.remove()};document.body.appendChild(d)});
document.querySelectorAll('form[data-ajax]').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();var b=f.querySelector('[type=submit]');b.disabled=true;
fetch(f.action,{method:'POST',body:new URLSearchParams(new FormData(f)),headers:{'Accept':'application/json'}}).then(function(r){if(!r.ok)throw 0;f.querySelector('.fields').hidden=true;b.hidden=true;f.querySelector('.form-msg').hidden=false}).catch(function(){b.disabled=false;alert('Sorry, something went wrong. Please try again.')})})});
})();`;

// Only in the admin live preview: click a section to select it, don't navigate.
const PREVIEW_SCRIPT = `document.addEventListener('click',function(e){var a=e.target.closest('a,button');if(a)e.preventDefault();var s=e.target.closest('[data-sec]');if(s)parent.postMessage({type:'sf-select',id:s.getAttribute('data-sec')},'*')},true);
document.addEventListener('submit',function(e){e.preventDefault()},true);`;

const PREVIEW_CSS = `html{scroll-behavior:auto!important}
[data-sec]{cursor:pointer}
[data-sec]:hover{outline:2px dashed rgba(99,102,241,.55);outline-offset:-2px}
[data-sec].sf-hl{outline:3px solid #6366f1;outline-offset:-3px}
.sf-hidden-sec{padding:12px;text-align:center;font:13px system-ui,sans-serif;color:#777;background:repeating-linear-gradient(45deg,#f4f4f6,#f4f4f6 10px,#ebebef 10px,#ebebef 20px)}`;

export { SITE_SCRIPT, PREVIEW_SCRIPT, PREVIEW_CSS };

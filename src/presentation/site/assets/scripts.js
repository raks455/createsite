'use strict';
// Small browser scripts inlined into rendered pages (no external requests).

// Runs on every page: sticky transparent header, mobile menu, scroll reveal,
// lightbox and AJAX form submission.
const SITE_SCRIPT = `(function(){
var hdr=document.querySelector('.site-header.transparent.sticky');
if(hdr){var f=function(){hdr.classList.toggle('scrolled',scrollY>10)};addEventListener('scroll',f,{passive:true});f()}
document.querySelectorAll('.nav-wrap a').forEach(function(a){a.addEventListener('click',function(){var t=document.getElementById('nav-toggle');if(t)t.checked=false})});
var secs=document.querySelectorAll('.sec');
if(document.body.hasAttribute('data-anim')&&'IntersectionObserver' in window){document.body.classList.add('anim');var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.08});secs.forEach(function(s){io.observe(s)})}else{secs.forEach(function(s){s.classList.add('in')})}
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

module.exports = { SITE_SCRIPT, PREVIEW_SCRIPT, PREVIEW_CSS };

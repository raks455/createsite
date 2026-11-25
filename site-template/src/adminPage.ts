// Small self-contained page at /_createsite/ to read and export form entries.
// The admin token is kept in sessionStorage and sent as a Bearer header.
export const ADMIN_PAGE = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Form entries</title>
<style>
body{margin:0;font:14px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;background:#f6f7f9;color:#16181d}
.wrap{max-width:1100px;margin:0 auto;padding:32px 20px}
h1{font-size:22px;margin:0 0 4px}.muted{color:#6b7080}
.card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-top:20px;overflow:auto}
input{font:inherit;padding:9px 12px;border:1px solid #d1d5db;border-radius:8px;width:320px;max-width:100%}
button{font:inherit;padding:9px 14px;border-radius:8px;border:1px solid #d1d5db;background:#fff;cursor:pointer}
button.primary{background:#111827;color:#fff;border-color:#111827}
table{border-collapse:collapse;width:100%;font-size:13px}th,td{text-align:left;padding:9px 10px;border-bottom:1px solid #eef0f3;vertical-align:top}
th{background:#fafbfc;white-space:nowrap}td{white-space:pre-wrap;word-break:break-word;max-width:320px}
.row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.err{color:#dc2626}
</style></head><body><div class="wrap">
<h1>Form entries</h1><p class="muted">Messages visitors sent through the forms on this website.</p>
<div class="card" id="login"><form class="row" id="f"><input id="t" type="password" placeholder="Admin token (ADMIN_TOKEN)" required><button class="primary">Open</button><span class="err" id="e"></span></form></div>
<div id="out"></div></div>
<script>
var KEY='cs_admin_token',out=document.getElementById('out');
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function api(p,m){return fetch('/_createsite'+p,{method:m||'GET',headers:{Authorization:'Bearer '+sessionStorage.getItem(KEY)}}).then(function(r){if(r.status===401){sessionStorage.removeItem(KEY);throw new Error('Wrong token')}if(!r.ok)throw new Error('Request failed');return r.json()})}
function csv(rows,cols){var q=function(v){return '"'+String(v==null?'':v).replace(/"/g,'""')+'"'};return [['date'].concat(cols).map(q).join(',')].concat(rows.map(function(r){return [r.createdAt].concat(cols.map(function(c){return r.fields[c]})).map(q).join(',')})).join('\\r\\n')}
function load(){api('/submissions').then(function(rows){document.getElementById('login').hidden=true;out.replaceChildren();
var cols=[];rows.forEach(function(r){Object.keys(r.fields).forEach(function(k){if(cols.indexOf(k)<0)cols.push(k)})});
var bar=el('div','row');bar.appendChild(el('b',null,rows.length+' entries'));var dl=el('button',null,'Download CSV');dl.onclick=function(){var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv(rows,cols)],{type:'text/csv'}));a.download='form-entries.csv';a.click()};bar.appendChild(dl);
var card=el('div','card');card.appendChild(bar);if(rows.length){var t=el('table'),h=el('tr');['Date'].concat(cols,['']).forEach(function(c){h.appendChild(el('th',null,c))});t.appendChild(h);
rows.forEach(function(r){var tr=el('tr');tr.appendChild(el('td',null,new Date(r.createdAt).toLocaleString()));cols.forEach(function(c){tr.appendChild(el('td',null,r.fields[c]||''))});var td=el('td'),b=el('button',null,'Delete');b.onclick=function(){if(confirm('Delete this entry?'))api('/submissions/'+r.id,'DELETE').then(load)};td.appendChild(b);tr.appendChild(td);t.appendChild(tr)});
card.appendChild(t)}out.appendChild(card)}).catch(function(e){document.getElementById('login').hidden=false;document.getElementById('e').textContent=e.message})}
document.getElementById('f').onsubmit=function(ev){ev.preventDefault();sessionStorage.setItem(KEY,document.getElementById('t').value);load()};
if(sessionStorage.getItem(KEY))load();
</script></body></html>`;

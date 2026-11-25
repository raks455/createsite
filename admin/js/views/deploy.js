// Deploy & code: hosting on this server, source-code export (TypeScript +
// Node.js + PostgreSQL) with Render + Neon steps, and a connected deployment
// that receives content pushes.
import { h, timeAgo } from '../core/dom.js';
import { get, put, post } from '../core/api.js';
import { toast } from '../core/ui.js';
import { icon } from '../core/icons.js';
import { renderSiteLayout, liveUrl } from '../components/shell.js';

const panel = (ico, title, sub, ...body) => h('div', { class: 'panel' },
  h('div', { class: 'panel-head' }, h('div', { class: 'panel-icon' }, icon(ico, 19)),
    h('div', null, h('h3', null, title), sub ? h('p', { class: 'muted small', style: 'margin-top:2px' }, sub) : null)),
  ...body);

export async function deployTab(site, reload) {
  const dep = await get(`/api/sites/${site.id}/deploy`);
  const g = site.settings.general;
  const origin = location.origin;

  // --- Connected deployment form ------------------------------------------
  const url = h('input', { value: dep.url, placeholder: `https://${g.slug}.onrender.com` });
  const token = h('input', { type: 'password', placeholder: dep.hasToken ? '•••••••• saved (leave empty to keep)' : 'Paste the ADMIN_TOKEN from Render' });
  const auto = h('input', { type: 'checkbox', checked: dep.autoSync });
  const status = h('div');
  const drawStatus = (d) => status.replaceChildren(
    d.lastError ? h('div', { class: 'status-line bad' }, `Last push failed: ${d.lastError}`)
      : d.lastSyncAt ? h('div', { class: 'status-line' },
        d.upToDate ? h('span', { class: 'pill ok' }, h('span', { class: 'dot' }), 'Up to date') : h('span', { class: 'pill warn' }, 'Unpushed changes'),
        h('span', { class: 'muted' }, `Last pushed ${timeAgo(d.lastSyncAt)}`))
        : d.url ? h('div', { class: 'status-line' }, h('span', { class: 'pill gray' }, 'Not pushed yet')) : null);
  drawStatus(dep);

  const busy = async (btn, fn) => { btn.disabled = true; try { await fn(); } catch (e) { toast(e.message, 'err'); } finally { btn.disabled = false; } };
  const saveCfg = () => put(`/api/sites/${site.id}/deploy`, { url: url.value, token: token.value, autoSync: auto.checked });

  const saveBtn = h('button', { class: 'btn sm', type: 'button' }, 'Save');
  saveBtn.onclick = () => busy(saveBtn, async () => { const d = await saveCfg(); token.value = ''; drawStatus(d); toast('Deployment settings saved'); site.deploy = { url: d.url }; });
  const testBtn = h('button', { class: 'btn sm', type: 'button' }, icon('zap', 14), 'Test connection');
  testBtn.onclick = () => busy(testBtn, async () => {
    await saveCfg(); token.value = '';
    const r = await post(`/api/sites/${site.id}/deploy/test`);
    toast(`Connected to “${r.name}” (${r.mediaCount} media files)`);
  });
  const pushBtn = h('button', { class: 'btn sm accent', type: 'button' }, icon('sync', 14), 'Push changes now');
  pushBtn.onclick = () => busy(pushBtn, async () => {
    await saveCfg(); token.value = '';
    const r = await post(`/api/sites/${site.id}/deploy/push`);
    toast(`Live site updated${r.uploadedMedia ? ` · ${r.uploadedMedia} file(s) uploaded` : ''}`);
    drawStatus(await get(`/api/sites/${site.id}/deploy`));
  });

  const entries = h('div');
  const loadEntries = h('button', { class: 'btn sm ghost', type: 'button' }, icon('forms', 14), 'Show form entries from the live site');
  loadEntries.onclick = () => busy(loadEntries, async () => {
    const rows = await get(`/api/sites/${site.id}/deploy/submissions`);
    const cols = [...new Set(rows.flatMap((r) => Object.keys(r.fields)))];
    entries.replaceChildren(rows.length
      ? h('div', { class: 'table-wrap' }, h('table', { class: 'table' },
        h('thead', null, h('tr', null, h('th', null, 'Date'), cols.map((c) => h('th', null, c)))),
        h('tbody', null, rows.map((r) => h('tr', null, h('td', { class: 'nowrap' }, new Date(r.createdAt).toLocaleString()), cols.map((c) => h('td', { class: 'cell' }, r.fields[c] ?? '')))))))
      : h('p', { class: 'muted small' }, 'No entries on the live site yet.'));
  });

  const connected = panel('sync', 'Connected deployment', 'Send edits to your deployed copy. It updates in seconds, with no redeploy.',
    h('div', { class: 'fields' },
      h('label', { class: 'fld half' }, h('span', { class: 'lbl' }, 'Deployed site URL'), url),
      h('label', { class: 'fld half' }, h('span', { class: 'lbl' }, 'Admin token'), token),
      h('label', { class: 'fld toggle' }, auto, h('span', { class: 'switch' }),
        h('span', { class: 'toggle-text' }, 'Auto-sync', h('small', { class: 'help' }, 'Push automatically a few seconds after every save.')))),
    status,
    h('div', { class: 'row wrap' }, pushBtn, testBtn, saveBtn, dep.url ? h('a', { class: 'btn sm ghost', href: dep.url, target: '_blank' }, 'Open live site', icon('external', 13)) : null),
    h('div', null, loadEntries), entries);

  // --- Source code export ------------------------------------------------
  const tree = h('div', { class: 'tree', html:
    `<em>${g.slug}/</em>\n├─ src/server.ts      <span>Express server: pages, forms, media</span>\n├─ src/db.ts          <span>PostgreSQL schema + queries</span>\n├─ src/admin.ts       <span>/_createsite sync API</span>\n├─ src/core/          <span>renderer + content model</span>\n├─ content/site.json  <span>this site's content</span>\n├─ content/media/     <span>your uploads</span>\n├─ render.yaml        <span>one-click Render Blueprint</span>\n└─ package.json, tsconfig.json, README.md` });
  const source = panel('code', 'Source code', 'This website as its own app. You own the code and can host it anywhere.',
    h('div', { class: 'tech' }, ['TypeScript', 'Node.js', 'Express', 'PostgreSQL'].map((t) => h('span', { class: 'pill gray' }, t))),
    tree,
    h('div', { class: 'row wrap' },
      h('a', { class: 'btn primary', href: `/api/sites/${site.id}/export-source.zip`, download: '' }, icon('download', 16), 'Download source code'),
      h('a', { class: 'btn sm ghost', href: `/api/sites/${site.id}/export.zip`, download: '' }, 'Static HTML (.zip)'),
      h('a', { class: 'btn sm ghost', href: `/api/sites/${site.id}/export.json`, download: '' }, 'Site package (.json)')));

  const steps = panel('deploy', 'Deploy it on Render + Neon', 'Takes about 5 minutes. Both have free plans.',
    h('ol', { class: 'steps' },
      h('li', null, h('b', null, 'Create a database on Neon. '), 'Go to neon.tech, create a project (or a new database), open ', h('b', null, 'Connect'), ' and copy the connection string.'),
      h('li', null, h('b', null, 'Push the code to GitHub. '), 'Unzip the download, then run ', h('code', null, 'git init'), ', commit and push to a new repository.'),
      h('li', null, h('b', null, 'Create a Blueprint on Render. '), 'Choose ', h('b', null, 'New + → Blueprint'), ' and pick the repository. Paste the Neon string as ', h('code', null, 'DATABASE_URL'), '.'),
      h('li', null, h('b', null, 'Connect it here. '), 'Copy ', h('code', null, 'ADMIN_TOKEN'), ' from the service’s Environment tab, then paste it with the site URL into Connected deployment.'),
      h('li', null, h('b', null, 'Optional: custom domain. '), 'Add it in Render under Settings → Custom Domains. HTTPS is automatic.')));

  const here = panel('globe', 'Hosted on this server', 'Already live, served by CreateSite itself.',
    h('div', { class: 'status-line' }, h('span', { class: 'pill ok' }, h('span', { class: 'dot' }), 'Live'),
      h('a', { href: liveUrl(site), target: '_blank' }, origin + liveUrl(site))),
    g.domains.length ? h('p', { class: 'small muted' }, `Custom domains: ${g.domains.join(', ')}`) : null,
    h('p', { class: 'help' }, 'To serve it at its own domain from here, add the domain under Site settings → Custom domains and point its DNS at this server. Your builder on Render then needs that domain added too.'));

  renderSiteLayout(site, 'deploy', h('div', { class: 'page-wrap' },
    h('div', { class: 'page-head' }, h('div', null, h('h1', null, 'Deploy & code'),
      h('p', { class: 'muted' }, 'Host this website, download its source code, and keep the live copy in sync.'))),
    h('div', { class: 'deploy-grid' }, h('div', { class: 'span' }, connected), source, steps, h('div', { class: 'span' }, here))));
}

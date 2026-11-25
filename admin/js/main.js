// Admin entry point: session bootstrap and hash router.
import { h, $ } from './core/dom.js';
import { get, post } from './core/api.js';
import { state, setDirty, runCleanups } from './core/state.js';
import { toast } from './core/ui.js';
import { renderShell } from './components/shell.js';
import { renderLogin } from './views/login.js';
import { sitesView } from './views/sites.js';
import { pagesTab } from './views/pages.js';
import { pageEditorView } from './views/pageEditor.js';
import { settingsTab } from './views/settings.js';
import { mediaTab } from './views/media.js';
import { formsTab } from './views/forms.js';
import { deployTab } from './views/deploy.js';
import { accountView } from './views/account.js';

const SETTINGS_TABS = ['theme', 'header', 'footer', 'seo', 'code', 'general'];

async function siteView(siteId, tab) {
  const site = await get(`/api/sites/${siteId}`);
  const reload = () => route();
  if (tab === 'pages') return pagesTab(site, reload);
  if (SETTINGS_TABS.includes(tab)) return settingsTab(site, tab, reload);
  if (tab === 'media') return mediaTab(site);
  if (tab === 'forms') return formsTab(site, reload);
  if (tab === 'deploy') return deployTab(site, reload);
  location.hash = `#/site/${siteId}/pages`;
}

async function route() {
  runCleanups();
  lastHash = location.hash;
  const [section, id, sub, subId] = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  try {
    if (!section) return await sitesView();
    if (section === 'account') return await accountView();
    if (section === 'site' && id) {
      if (sub === 'page' && subId) return await pageEditorView(id, subId);
      return await siteView(id, sub || 'pages');
    }
    location.hash = '#/';
  } catch (e) {
    if (!state.me) return;
    renderShell(h('div', { class: 'empty' }, h('div', { class: 'empty-icon' }, '⚠'), h('h2', null, 'Something went wrong'),
      h('p', { class: 'muted' }, e.message), h('a', { class: 'btn', href: '#/' }, 'Back to websites')), [{ label: 'Websites', href: '#/' }]);
  }
}

// Navigation guard for unsaved changes
let lastHash = location.hash;
let skipNext = false;
window.addEventListener('hashchange', () => {
  if (skipNext) { skipNext = false; return; }
  if (state.dirty && !confirm('You have unsaved changes. Leave without saving?')) {
    skipNext = true;
    location.hash = lastHash;
    return;
  }
  setDirty(false);
  route();
});
window.addEventListener('beforeunload', (e) => { if (state.dirty) { e.preventDefault(); e.returnValue = ''; } });

function showLogin() {
  state.me = null;
  setDirty(false);
  runCleanups();
  renderLogin(async (user) => { state.me = user; await start(); });
}

window.addEventListener('sf:unauthorized', () => { if (state.me) { toast('Your session expired — please sign in again', 'err'); showLogin(); } });
window.addEventListener('sf:logout', async () => {
  if (state.dirty && !confirm('You have unsaved changes. Log out anyway?')) return;
  await post('/api/logout').catch(() => {});
  showLogin();
});

async function start() {
  state.schema = await get('/api/schema');
  $('#sf-fonts').replaceChildren(...state.schema.fonts.map((f) => h('option', { value: f })));
  await route();
}

(async function boot() {
  try {
    state.me = (await get('/api/me')).user;
  } catch {
    return showLogin();
  }
  await start();
})();

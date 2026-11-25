// Account: change password and manage admin users.
import { h, timeAgo } from '../core/dom.js';
import { get, post, del } from '../core/api.js';
import { state } from '../core/state.js';
import { toast, confirmBox, promptForm } from '../core/ui.js';
import { renderShell } from '../components/shell.js';

export async function accountView() {
  const users = await get('/api/users');
  const current = h('input', { type: 'password', autocomplete: 'current-password' });
  const next = h('input', { type: 'password', autocomplete: 'new-password', placeholder: 'At least 8 characters' });

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      await post('/api/me/password', { current: current.value, password: next.value });
      current.value = next.value = '';
      toast('Password changed — other sessions were signed out');
    } catch (err) { toast(err.message, 'err'); }
  };

  const addUser = async () => {
    const v = await promptForm('Add admin user', [
      { key: 'username', label: 'Username', required: true },
      { key: 'password', label: 'Password', type: 'password', required: true, help: 'At least 8 characters' },
    ], { submitLabel: 'Add user' });
    if (!v) return;
    try { await post('/api/users', v); toast('User added'); accountView(); } catch (e) { toast(e.message, 'err'); }
  };

  renderShell(h('div', { class: 'page-wrap narrow' },
    h('div', { class: 'page-head' }, h('h1', null, 'Account')),
    h('form', { class: 'panel stack', onsubmit: changePassword },
      h('h3', null, 'Change password'),
      h('label', { class: 'fld' }, h('span', { class: 'lbl' }, 'Current password'), current),
      h('label', { class: 'fld' }, h('span', { class: 'lbl' }, 'New password'), next),
      h('div', null, h('button', { class: 'btn primary', type: 'submit' }, 'Update password'))),
    h('div', { class: 'panel' },
      h('div', { class: 'page-head' }, h('h3', null, 'Admin users'), h('button', { class: 'btn sm', onclick: addUser }, '+ Add user')),
      h('div', { class: 'page-list' }, users.map((u) => h('div', { class: 'page-row' },
        h('div', { class: 'pr-main' }, h('b', null, u.username), h('span', { class: 'muted small' }, `added ${timeAgo(u.createdAt)}`)),
        u.id === state.me.id ? h('span', { class: 'pill' }, 'You') : h('button', { class: 'btn xs danger-ghost', onclick: async () => {
          if (!(await confirmBox(`Remove user “${u.username}”?`))) return;
          try { await del(`/api/users/${u.id}`); toast('User removed'); accountView(); } catch (e) { toast(e.message, 'err'); }
        } }, 'Remove')))))),
  [{ label: 'Websites', href: '#/' }, { label: 'Account' }]);
}

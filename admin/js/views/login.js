import { h, $ } from '../core/dom.js';
import { post } from '../core/api.js';
import { icon } from '../core/icons.js';
import { brand } from '../components/shell.js';

export function renderLogin(onSuccess) {
  const error = h('div', { class: 'err' });
  const username = h('input', { placeholder: 'Username', autocomplete: 'username', required: true });
  const password = h('input', { type: 'password', placeholder: 'Password', autocomplete: 'current-password', required: true });
  const button = h('button', { class: 'btn primary block', type: 'submit' }, 'Sign in');
  const form = h('form', { class: 'login-card', onsubmit: async (e) => {
    e.preventDefault();
    error.textContent = '';
    button.disabled = true;
    try {
      const { user } = await post('/api/login', { username: username.value, password: password.value });
      await onSuccess(user);
    } catch (err) {
      error.textContent = err.message;
      button.disabled = false;
    }
  } },
  h('div', null, h('h1', null, 'Welcome back'), h('p', { class: 'muted', style: 'margin-top:6px' }, 'Sign in to manage your websites.')),
  h('label', { class: 'fld' }, h('span', { class: 'lbl' }, 'Username'), username),
  h('label', { class: 'fld' }, h('span', { class: 'lbl' }, 'Password'), password),
  error, button);

  const feat = (ico, text) => h('span', null, icon(ico, 14), text);
  $('#app').replaceChildren(h('div', { class: 'login-wrap' },
    h('div', { class: 'login-art' },
      brand('brand big'),
      h('div', null,
        h('h2', null, 'Design it visually. ', h('span', null, 'Ship it anywhere.')),
        h('p', null, 'Build websites with live preview and motion that fits the brand. Host them here, or export each one as its own TypeScript, Node.js and PostgreSQL app.')),
      h('div', { class: 'login-feats' },
        feat('sparkle', 'Elegant & expressive motion'), feat('database', 'PostgreSQL / Neon'),
        feat('deploy', 'One-click Render deploy'), feat('code', 'TypeScript source export'))),
    h('div', { class: 'login-side' }, form)));
  username.focus();
}

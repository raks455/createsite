import { h, $ } from '../core/dom.js';
import { post } from '../core/api.js';

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
  h('div', { class: 'brand big' }, h('span', { class: 'brand-mark' }, '◆'), 'SiteForge'),
  h('p', { class: 'muted' }, 'Sign in to manage your websites'),
  username, password, error, button);
  $('#app').replaceChildren(h('div', { class: 'login-wrap' }, form));
  username.focus();
}

// Global admin state: current user, content schema, unsaved-changes flag and
// per-view cleanup callbacks (run when navigating away).
export const state = {
  me: null,
  schema: null,
  dirty: false,
  cleanups: [],
};

export function setDirty(value) {
  state.dirty = value;
  document.body.classList.toggle('is-dirty', value);
}

export const onLeave = (fn) => state.cleanups.push(fn);

export function runCleanups() {
  state.cleanups.splice(0).forEach((fn) => { try { fn(); } catch {} });
}

/** Ctrl/Cmd+S triggers save while the current view is open. */
export function bindSaveShortcut(save) {
  const handler = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); }
  };
  document.addEventListener('keydown', handler);
  onLeave(() => document.removeEventListener('keydown', handler));
}

// HTTP client for the admin API. Emits "sf:unauthorized" when the session ends.
export async function api(method, url, body) {
  const opts = { method, headers: { Accept: 'application/json' } };
  if (body instanceof FormData) opts.body = body;
  else if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  const type = res.headers.get('content-type') || '';
  const data = type.includes('json') ? await res.json() : await res.text();
  if (!res.ok) {
    if (res.status === 401 && !url.endsWith('/login') && !url.endsWith('/me')) window.dispatchEvent(new Event('sf:unauthorized'));
    throw new Error((data && data.error) || res.statusText || 'Request failed');
  }
  return data;
}

export const get = (url) => api('GET', url);
export const post = (url, body) => api('POST', url, body ?? {});
export const put = (url, body) => api('PUT', url, body);
export const del = (url) => api('DELETE', url);

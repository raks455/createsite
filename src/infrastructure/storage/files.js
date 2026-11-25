'use strict';
// File naming and MIME types shared by every MediaStorage adapter.
const path = require('path');

const MIME = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
  '.avif': 'image/avif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.mov': 'video/quicktime', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.pdf': 'application/pdf',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.txt': 'text/plain',
  '.csv': 'text/csv', '.json': 'application/json', '.zip': 'application/zip',
};

const mimeOf = (name) => MIME[path.extname(String(name)).toLowerCase()] || 'application/octet-stream';
const safeName = (name) => path.basename(String(name || ''));

/** "My Photo.JPG" -> "my-photo-lx2k9a3f.jpg" (unique, URL-safe). */
function uniqueFileName(originalName) {
  const ext = path.extname(originalName).toLowerCase().replace(/[^.a-z0-9]/g, '');
  const stem = path.basename(originalName, path.extname(originalName)).toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'file';
  return `${stem}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}${ext}`;
}

module.exports = { MIME, mimeOf, safeName, uniqueFileName };

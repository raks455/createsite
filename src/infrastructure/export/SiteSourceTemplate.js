'use strict';
// Reads the files of an exported site's source code: the project template in
// site-template/ plus the TypeScript renderer from core/src (copied to src/core).
// {{NAME}} and {{SLUG}} in template text files are replaced.
const fs = require('fs/promises');
const path = require('path');

async function walk(dir, prefix = '') {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const rel = prefix + entry.name;
    if (entry.isDirectory()) out.push(...(await walk(path.join(dir, entry.name), `${rel}/`)));
    else out.push(rel);
  }
  return out;
}

const fill = (text, vars) => text.replace(/\{\{(\w+)\}\}/g, (m, key) => (key in vars ? String(vars[key]) : m));

class SiteSourceTemplate {
  constructor({ templateDir, coreSrcDir }) {
    this.templateDir = templateDir;
    this.coreSrcDir = coreSrcDir;
  }

  async files(vars) {
    const entries = [];
    for (const rel of await walk(this.templateDir)) {
      const text = await fs.readFile(path.join(this.templateDir, rel), 'utf8');
      entries.push({ name: rel, content: fill(text, vars) });
    }
    for (const rel of await walk(this.coreSrcDir)) {
      entries.push({ name: `src/core/${rel}`, content: await fs.readFile(path.join(this.coreSrcDir, rel)) });
    }
    return entries;
  }
}

module.exports = SiteSourceTemplate;

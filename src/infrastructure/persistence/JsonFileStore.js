'use strict';
// A tiny document store backed by one JSON file. Data lives in memory and is
// written atomically after every change. Repositories sit on top of it.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class JsonFileStore {
  constructor(file) {
    this.file = file;
    this.data = null;
  }

  load() {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    let data = {};
    if (fs.existsSync(this.file)) {
      data = JSON.parse(fs.readFileSync(this.file, 'utf8'));
      fs.copyFileSync(this.file, `${this.file}.bak`); // last good start
    }
    data.meta = data.meta || {};
    data.meta.secret = data.meta.secret || crypto.randomBytes(32).toString('hex');
    this.data = data;
    this.persist();
    return this;
  }

  collection(name) {
    if (!this.data[name]) this.data[name] = [];
    return this.data[name];
  }

  replaceCollection(name, items) {
    this.data[name] = items;
  }

  get meta() {
    return this.data.meta;
  }

  persist() {
    const json = JSON.stringify(this.data, null, 1);
    const tmp = `${this.file}.tmp`;
    fs.writeFileSync(tmp, json);
    try {
      fs.renameSync(tmp, this.file);
    } catch {
      // Windows can refuse rename while another process (e.g. antivirus) holds the file
      fs.writeFileSync(this.file, json);
      try { fs.unlinkSync(tmp); } catch {}
    }
  }
}

module.exports = JsonFileStore;

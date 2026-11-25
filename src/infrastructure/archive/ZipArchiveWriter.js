'use strict';
const archiver = require('archiver');

class ZipArchiveWriter {
  zip(entries, output) {
    return new Promise((resolve, reject) => {
      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.on('error', reject);
      output.on('close', resolve);
      output.on('finish', resolve);
      archive.pipe(output);
      for (const e of entries) archive.append(e.content, { name: e.name });
      archive.finalize().catch(reject);
    });
  }
}

module.exports = ZipArchiveWriter;

'use strict';
const { NotFoundError } = require('../../domain/errors');

const ALLOWED_EXTENSIONS = /\.(png|jpe?g|gif|webp|avif|svg|ico|mp4|webm|mov|mp3|wav|ogg|pdf|woff2?|ttf|otf|txt|csv|json|zip|docx?|xlsx?|pptx?)$/i;

class MediaService {
  constructor({ siteRepo, mediaStorage }) {
    this.sites = siteRepo;
    this.media = mediaStorage;
  }

  async #assertSite(siteId) {
    if (!(await this.sites.findById(siteId))) throw new NotFoundError('Site not found');
  }

  async list(siteId) {
    await this.#assertSite(siteId);
    return this.media.list(siteId);
  }

  /** @param {{originalName: string, buffer: Buffer}[]} files */
  async upload(siteId, files) {
    await this.#assertSite(siteId);
    const saved = [];
    const rejected = [];
    for (const file of files) {
      if (!ALLOWED_EXTENSIONS.test(file.originalName)) rejected.push(file.originalName);
      else saved.push(await this.media.save(siteId, file.originalName, file.buffer));
    }
    return { files: saved, rejected };
  }

  async remove(siteId, name) {
    await this.#assertSite(siteId);
    await this.media.remove(siteId, name);
  }
}

module.exports = MediaService;

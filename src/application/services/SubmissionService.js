'use strict';
const { createSubmission } = require('../../domain/entities/Submission');
const { NotFoundError } = require('../../domain/errors');

class SubmissionService {
  constructor({ siteRepo, submissionRepo }) {
    this.sites = siteRepo;
    this.submissions = submissionRepo;
  }

  /** Stores a visitor's form entry. Silently drops obvious spam (honeypot). */
  async submit(siteId, fields, { ip = '' } = {}) {
    if (fields && fields._hp) return null;
    const submission = createSubmission({ siteId, pageId: fields._page, blockId: fields._block, fields: fields || {}, ip });
    await this.submissions.save(submission);
    return submission;
  }

  async list(siteId) {
    if (!(await this.sites.findById(siteId))) throw new NotFoundError('Site not found');
    const all = await this.submissions.findBySite(siteId);
    return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async remove(siteId, id) {
    const sub = await this.submissions.findById(id);
    if (!sub || sub.siteId !== siteId) throw new NotFoundError('Entry not found');
    await this.submissions.delete(id);
  }

  async clear(siteId) {
    await this.submissions.deleteBySite(siteId);
  }
}

module.exports = SubmissionService;

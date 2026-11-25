'use strict';
/**
 * Ports: the interfaces the application layer depends on. Infrastructure
 * provides the implementations, wired together in src/main.js.
 * To move from JSON files to Postgres/Mongo/S3, implement these and change
 * only the composition root.
 *
 * @typedef {Object} SiteRepository
 * @property {() => Promise<object[]>} findAll
 * @property {(id: string) => Promise<object|null>} findById
 * @property {(slug: string) => Promise<object|null>} findBySlug
 * @property {(host: string) => Promise<object|null>} findByDomain
 * @property {(site: object) => Promise<void>} save
 * @property {(id: string) => Promise<void>} delete
 *
 * @typedef {Object} UserRepository
 * @property {() => Promise<object[]>} findAll
 * @property {(id: string) => Promise<object|null>} findById
 * @property {(username: string) => Promise<object|null>} findByUsername
 * @property {() => Promise<number>} count
 * @property {(user: object) => Promise<void>} save
 * @property {(id: string) => Promise<void>} delete
 *
 * @typedef {Object} SubmissionRepository
 * @property {(siteId: string) => Promise<object[]>} findBySite
 * @property {(id: string) => Promise<object|null>} findById
 * @property {(submission: object) => Promise<void>} save
 * @property {(id: string) => Promise<void>} delete
 * @property {(siteId: string) => Promise<void>} deleteBySite
 *
 * @typedef {{name: string, url: string, size: number, type: string, modifiedAt: string}} MediaFile
 * @typedef {Object} MediaStorage
 * @property {(siteId: string) => Promise<MediaFile[]>} list
 * @property {(siteId: string, originalName: string, buffer: Buffer) => Promise<MediaFile>} save
 * @property {(siteId: string, name: string) => Promise<void>} remove
 * @property {(siteId: string) => Promise<void>} removeAll
 * @property {(fromSiteId: string, toSiteId: string) => Promise<void>} copyAll
 * @property {(siteId: string) => Promise<{name: string, buffer: Buffer}[]>} readAll
 * @property {(siteId: string, files: {name: string, buffer: Buffer}[]) => Promise<void>} writeAll
 * @property {(siteId: string) => string} publicPrefix  URL prefix of a site's files, e.g. "/uploads/<id>/"
 *
 * @typedef {Object} PasswordHasher
 * @property {(password: string) => Promise<string>} hash
 * @property {(password: string, hash: string) => Promise<boolean>} verify
 *
 * @typedef {Object} TokenService
 * @property {(payload: object, ttlSeconds: number) => string} sign
 * @property {(token: string) => object|null} verify
 *
 * @typedef {Object} SiteRenderer
 * @property {(args: {site: object, page: object, base: string, mode: 'live'|'preview'|'export'}) => string} renderPage
 * @property {(args: {site: object, kind: '404'|'maintenance', base: string, mode?: string}) => string} renderSpecial
 *
 * @typedef {Object} ArchiveWriter
 * @property {(entries: {name: string, content: string|Buffer}[], output: import('stream').Writable) => Promise<void>} zip
 */
module.exports = {};

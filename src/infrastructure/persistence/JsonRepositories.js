'use strict';
// Repository implementations on top of JsonFileStore.
// They return copies so callers never mutate stored data without save().
const copy = (o) => (o == null ? null : JSON.parse(JSON.stringify(o)));

class JsonCollection {
  constructor(store, name) {
    this.store = store;
    this.name = name;
  }
  get items() { return this.store.collection(this.name); }
  async findAll() { return copy(this.items); }
  async findById(id) { return copy(this.items.find((x) => x.id === id)); }
  async count() { return this.items.length; }
  async save(entity) {
    const list = this.items;
    const i = list.findIndex((x) => x.id === entity.id);
    if (i >= 0) list[i] = copy(entity); else list.push(copy(entity));
    this.store.persist();
  }
  async delete(id) {
    this.store.replaceCollection(this.name, this.items.filter((x) => x.id !== id));
    this.store.persist();
  }
}

class JsonSiteRepository extends JsonCollection {
  constructor(store) { super(store, 'sites'); }
  async findBySlug(slug) {
    return copy(this.items.find((s) => s.settings?.general?.slug === slug));
  }
  async findByDomain(host) {
    if (!host) return null;
    return copy(this.items.find((s) => (s.settings?.general?.domains || []).includes(host)));
  }
}

class JsonUserRepository extends JsonCollection {
  constructor(store) { super(store, 'users'); }
  async findByUsername(username) {
    return copy(this.items.find((u) => u.username === username));
  }
}

class JsonSubmissionRepository extends JsonCollection {
  constructor(store) { super(store, 'submissions'); }
  async findBySite(siteId) {
    return copy(this.items.filter((x) => x.siteId === siteId));
  }
  async deleteBySite(siteId) {
    this.store.replaceCollection(this.name, this.items.filter((x) => x.siteId !== siteId));
    this.store.persist();
  }
}

module.exports = { JsonSiteRepository, JsonUserRepository, JsonSubmissionRepository };

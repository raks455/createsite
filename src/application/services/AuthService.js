'use strict';
const User = require('../../domain/entities/User');
const { UnauthorizedError, ValidationError, ConflictError, NotFoundError } = require('../../domain/errors');

class AuthService {
  constructor({ userRepo, passwordHasher, tokenService, sessionTtlSeconds = 7 * 24 * 3600 }) {
    this.users = userRepo;
    this.hasher = passwordHasher;
    this.tokens = tokenService;
    this.ttl = sessionTtlSeconds;
  }

  /** Creates the first admin on a fresh install. Returns the user or null if users exist. */
  async ensureInitialAdmin(username, password) {
    if (await this.users.count()) return null;
    const user = User.createUser(username, await this.hasher.hash(password));
    await this.users.save(user);
    return User.publicUser(user);
  }

  async login(username, password) {
    const user = await this.users.findByUsername(User.normalizeUsername(username));
    const ok = user && (await this.hasher.verify(String(password || ''), user.passwordHash));
    if (!ok) throw new UnauthorizedError('Invalid username or password');
    return { user: User.publicUser(user), token: this.#issue(user) };
  }

  /** Returns the public user for a session token, or null. */
  async authenticate(token) {
    const payload = token && this.tokens.verify(token);
    if (!payload) return null;
    const user = await this.users.findById(payload.uid);
    return user && user.tokenVersion === payload.tv ? User.publicUser(user) : null;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    if (!(await this.hasher.verify(String(currentPassword || ''), user.passwordHash))) {
      throw new ValidationError('Current password is incorrect');
    }
    User.validateCredentials(user.username, newPassword);
    user.passwordHash = await this.hasher.hash(newPassword);
    user.tokenVersion += 1; // signs out every other session
    await this.users.save(user);
    return { token: this.#issue(user) };
  }

  async listUsers() {
    return (await this.users.findAll()).map(User.publicUser);
  }

  async createUser(username, password) {
    User.validateCredentials(username, password);
    if (await this.users.findByUsername(User.normalizeUsername(username))) throw new ConflictError('That username is taken');
    const user = User.createUser(username, await this.hasher.hash(password));
    await this.users.save(user);
    return User.publicUser(user);
  }

  async deleteUser(id, actingUserId) {
    if (id === actingUserId) throw new ValidationError("You can't delete your own account");
    if (!(await this.users.findById(id))) throw new NotFoundError('User not found');
    await this.users.delete(id);
  }

  #issue(user) {
    return this.tokens.sign({ uid: user.id, tv: user.tokenVersion }, this.ttl);
  }
}

module.exports = AuthService;

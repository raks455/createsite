'use strict';
// Domain/application errors. The HTTP layer maps `status` to a response code.
class AppError extends Error {
  constructor(message, status = 400, code = 'BAD_REQUEST') {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
  }
}
class ValidationError extends AppError { constructor(m) { super(m, 400, 'VALIDATION'); } }
class NotFoundError extends AppError { constructor(m = 'Not found') { super(m, 404, 'NOT_FOUND'); } }
class UnauthorizedError extends AppError { constructor(m = 'Not signed in') { super(m, 401, 'UNAUTHORIZED'); } }
class ConflictError extends AppError { constructor(m) { super(m, 409, 'CONFLICT'); } }

module.exports = { AppError, ValidationError, NotFoundError, UnauthorizedError, ConflictError };

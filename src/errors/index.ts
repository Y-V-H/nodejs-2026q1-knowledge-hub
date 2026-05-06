// NotFoundError — 404
// ValidationError — 400
// UnauthorizedError — 401
// ForbiddenError — 403

export class NotFoundError extends Error {
  statusCode = 404;

  constructor(message = 'Not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  statusCode = 400;

  constructor(message = 'Validation error') {
    super(message);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends Error {
  statusCode = 401;

  constructor(message = 'Unauthorized error') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  statusCode = 403;

  constructor(message = 'Forbidden error') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

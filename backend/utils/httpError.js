class HttpError extends Error {
  constructor(status, message, details) {
    super(message);

    this.name = "HttpError";
    this.status = status;

    if (details !== undefined) {
      this.details = details;
    }

    Error.captureStackTrace?.(this, HttpError);
  }
}

function createHttpError(status, message, details) {
  return new HttpError(status, message, details);
}

module.exports = {
  HttpError,
  createHttpError,
};

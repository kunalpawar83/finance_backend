class AppError extends Error {
    constructor(statusCode, message) {
        super('');
        this.customMessage = message;
        this.statusCode = statusCode;
        this.status = false;
        this.data = null;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
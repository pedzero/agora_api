import { AppError } from '../utils/errors.js';

export function errorHandler(error, request, response, next) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const message = error.message || 'Internal server error';

    console.error(`[Error] ${request.method} ${request.url} - ${statusCode} - ${message}`);

    response.status(statusCode).json({ error: message });
}
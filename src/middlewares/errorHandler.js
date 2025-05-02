import multer from 'multer';
import { AppError } from '../utils/errors.js';
import { ZodError } from 'zod';

export function errorHandler(error, request, response, next) {
    let statusCode = error instanceof AppError ? error.statusCode : 500;
    let message = error.message || 'Internal server error';

    if (error instanceof multer.MulterError) {
        statusCode = 400;

        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            message = 'Too much files sent';
        } else if (error.code === 'LIMIT_FILE_SIZE') {
            message = 'The uploaded file size is too large';
        } else {
            message = error.message;
        }
    }

    if (error instanceof ZodError) {
        statusCode = 400;
        const errors = error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
        }));

        return response.status(statusCode).json({
            error: 'Validation failed',
            details: errors,
        });
    }

    console.error(`[Error] ${request.method} ${request.url} - ${statusCode} - ${message}`, error);

    response.status(statusCode).json({ error: message });
}

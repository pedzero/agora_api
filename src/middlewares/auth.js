import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import { UnauthorizedError } from '../utils/errors.js';
import { isTokenBlacklisted } from '../lib/blacklist.js';

export async function authenticate(request, response, next) {
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];

    if (await isTokenBlacklisted(token)) {
        return response.status(401).json({ error: 'Token revoked' });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        request.user = {
            id: payload.sub,
            email: payload.email
        };
        next();
    } catch {
        throw new UnauthorizedError('Invalid or expired token');
    }
}

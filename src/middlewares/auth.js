import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import { UnauthorizedError } from '../utils/errors.js';
import { isTokenBlacklisted } from '../lib/blacklist.js';
import { getTokenFromHeader } from '../utils/token.js';

export async function authenticate(request, response, next) {
    const token = getTokenFromHeader(request);

    if (!token) {
        throw new UnauthorizedError('Missing or invalid authorization header');
    }

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

export async function optionalAuth(request, response, next) {
    const token = getTokenFromHeader(request);

    let authenticated = true;
    if (!token) {
        authenticated = false;
    }

    if (await isTokenBlacklisted(token)) {
        authenticated = false;
    }

    if (authenticated) {
        try {
            const payload = jwt.verify(token, JWT_SECRET);
            request.user = {
                id: payload.sub,
                email: payload.email
            };
        } catch (error) {
            request.user = null;
        }
    } else {
        request.user = null;
    }
    next();
}

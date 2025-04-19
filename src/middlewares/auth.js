import { verifyToken } from '../lib/jwt.js';

export function authenticate(request, response, next) {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({ error: 'Token not provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyToken(token);
        request.user = {
            id: decoded.sub,
        };
        next();
    } catch (err) {
        return response.status(401).json({ error: 'Invalid token' });
    }
}

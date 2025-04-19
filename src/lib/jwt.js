import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/env.js';

export function generateToken(payload, options = {}) {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        ...options,
    });
}

export function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

export function decodeToken(token) {
    return jwt.decode(token);
}

import jwt from 'jsonwebtoken';
import { loadEnv } from '../config/env.js';

loadEnv();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

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

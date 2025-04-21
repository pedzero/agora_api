import { redis } from "./redis.js";
import ms from 'ms';
import { JWT_EXPIRES_IN } from '../config/env.js';

const DEFAULT_EXPIRES_IN = ms(JWT_EXPIRES_IN || '1h') / 1000;

export async function blacklistToken(token, expiresIn = DEFAULT_EXPIRES_IN) {
    await redis.set(`blacklist:${token}`, '1', { EX: expiresIn });
}

export async function isTokenBlacklisted(token) {
    const exists = await redis.get(`blacklist:${token}`);
    return !!exists;
}
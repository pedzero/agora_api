import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { generateToken } from '../../lib/jwt.js';

export async function register({ name, email, password }) {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
        throw new Error('Email is already in use');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
        },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
        }
    });

    return { user };
}

export async function login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
        throw new Error('Invalid credentials');
    }

    const token = generateToken({ sub: user.id });

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
    };
}

import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { generateToken } from '../../lib/jwt.js';
import { BadRequestError, UnauthorizedError, ConflictError } from '../../utils/errors.js';
import { uploadImage } from '../../lib/upload.js';

export async function register({ name, email, password, username, profilePicture }) {
    if (!name || !email || !password || !username) {
        throw new BadRequestError('Missing required fields');
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new ConflictError('Email is already in use');
    }

    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
        throw new ConflictError('Username is already in use');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    let url;
    if (profilePicture) {
        url = await uploadImage(profilePicture);
    }

    const user = await prisma.user.create({
        data: {
            name,
            email,
            username,
            profilePicture: url,
            passwordHash,
        },
        select: {
            id: true,
            name: true,
            email: true,
            username: true,
            profilePicture: true,
            createdAt: true,
        }
    });

    return { user };
}

export async function login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        throw new UnauthorizedError('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid credentials');
    }

    const token = generateToken({
        sub: user.id,
        email: user.email
    });

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
    };
}

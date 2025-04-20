import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../utils/errors.js';

export async function getOwnProfile(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            username: true,
            profilePicture: true,
            createdAt: true,
        },
    });

    if (!user) {
        throw new NotFoundError('User not found');
    }

    return user;
}

export async function updateOwnProfile(userId, data) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');

    let updatedData = { ...data };
    if (data.password) {
        updatedData.passwordHash = await bcrypt.hash(data.password, 10);
        delete updatedData.password;
    }

    if (data.username && data.username !== user.username) {
        const existing = await prisma.user.findUnique({ where: { username: data.username } });
        if (existing) throw new ConflictError('Username already taken');
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updatedData,
        select: {
            id: true,
            name: true,
            email: true,
            username: true,
            profilePicture: true,
            createdAt: true,
        }
    });

    return updatedUser;
}

export async function deleteOwnProfile(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new NotFoundError('User not found');
    }

    await prisma.user.delete({
        where: { id: userId }
    });

    return { message: 'User deleted successfully' };
}
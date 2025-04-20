import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../utils/errors.js';

export async function getOwnProfile(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
        },
    });

    if (!user) {
        throw new NotFoundError('User not found');
    }

    return user;
}

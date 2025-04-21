import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { BadRequestError, ConflictError, NotFoundError } from '../../utils/errors.js';

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

export async function searchUsersByUsername(query) {
    if (!query) return [{}];

    return prisma.user.findMany({
        where: {
            username: {
                contains: query
            }
        },
        select: {
            id: true,
            name: true,
            username: true,
            profilePicture: true
        }
    });
}

export async function getFollowersByUsername(username) {
    const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true }
    });

    if (!user) {
        throw new NotFoundError('User not found');
    }

    const followers = await prisma.follower.findMany({
        where: { followingId: user.id },
        include: {
            follower: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    profilePicture: true
                }
            }
        }
    });

    return followers.map(entry => entry.follower);
}

export async function getFollowingsByUsername(username) {
    const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true }
    });

    if (!user) {
        throw new NotFoundError('User not found');
    }

    const followings = await prisma.follower.findMany({
        where: { followerId: user.id },
        include: {
            following: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    profilePicture: true
                }
            }
        }
    });

    return followings.map(entry => entry.following);
}

export async function followUserByUsername(currentUserId, username) {
    // TODO: revoke deleted users tokens
    const currentUser = await prisma.user.findUnique({
        where: { id: currentUserId }
    });

    if (!currentUser) {
        throw new NotFoundError('Current user not found');
    }

    const targetUser = await prisma.user.findUnique({
        where: { username },
        select: { id: true }
    });

    if (!targetUser) {
        throw new NotFoundError('Target user not found');
    }

    if (currentUserId === targetUser.id) {
        throw new BadRequestError('You cannot follow yourself');
    }

    const alreadyFollowing = await prisma.follower.findUnique({
        where: {
            followerId_followingId: {
                followerId: currentUserId,
                followingId: targetUser.id
            }
        }
    });

    if (alreadyFollowing) {
        throw new ConflictError('Target user already followed');
    }

    await prisma.follower.create({
        data: {
            followerId: currentUserId,
            followingId: targetUser.id
        },
        select: {
            followerId: true,
            followingId: true
        }
    });

    return {
        message: `You are now following @${username}`,
        following: username
    };
}

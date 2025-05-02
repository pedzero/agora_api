import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { BadRequestError, ConflictError, NotFoundError } from '../../utils/errors.js';
import { blacklistToken } from '../../lib/blacklist.js';
import { deleteImage, uploadImage } from '../../lib/upload.js';
import { getFileNameFromURL } from '../../utils/filename.js';

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

    if (data.profilePicture) {
        const fileName = getFileNameFromURL(user.profilePicture);
        if (fileName) {
            await deleteImage(fileName);
        }

        updatedData.profilePicture = await uploadImage(data.profilePicture);
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

export async function deleteOwnProfile(userId, token) {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new NotFoundError('User not found');
    }

    const fileName = getFileNameFromURL(user.profilePicture);
    if (fileName) {
        await deleteImage(fileName);
    }

    await prisma.user.delete({
        where: { id: userId }
    });

    if (token) {
        await blacklistToken(token);
    }

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
            name: true,
            username: true,
            profilePicture: true
        }
    });
}

export async function getUserByUsername(username) {
    if (!username) {
        throw new BadRequestError('Username is required');
    }

    return await prisma.user.findUnique({
        where: { username },
        select: {
            name: true,
            username: true,
            profilePicture: true
        }
    });
}

export async function getUserPosts(username) {
    if (!username) {
        throw new BadRequestError('Username is required');
    }

    const user = await prisma.user.findUnique({
        where: { username },
    });

    if (!user) {
        throw new NotFoundError('User not found');
    }

    return await prisma.post.findMany({
        where: { userId: user.id },
        include: { photos: true },
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

export async function unfollowUserByUsername(currentUserId, username) {
    const targetUser = await prisma.user.findUnique({
        where: { username },
        select: { id: true }
    });

    if (!targetUser) {
        throw new NotFoundError('Target user not found');
    }

    if (currentUserId === targetUser.id) {
        throw new BadRequestError('You cannot unfollow yourself');
    }

    const alreadyFollowing = await prisma.follower.findUnique({
        where: {
            followerId_followingId: {
                followerId: currentUserId,
                followingId: targetUser.id
            }
        }
    });

    if (!alreadyFollowing) {
        throw new ConflictError('Target user not followed yet');
    }

    await prisma.follower.delete({
        where: {
            followerId_followingId: {
                followerId: currentUserId,
                followingId: targetUser.id
            }
        }
    });

    return {
        message: `You are no longer following @${username}`,
        following: username
    };
}

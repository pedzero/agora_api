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
            name: true,
            email: true,
            username: true,
            reputation: true,
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
            name: true,
            email: true,
            username: true,
            reputation: true,
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
            reputation: true,
            profilePicture: true
        }
    });
}

export async function getUserByUsername(username) {
    if (!username) {
        throw new BadRequestError('Username is required');
    }

    const user = await prisma.user.findUnique({
        where: { username },
        select: {
            name: true,
            username: true,
            reputation: true,
            profilePicture: true
        }
    });

    if (!user) {
        throw new NotFoundError('User not found');
    }

    return user;
}

export async function getUserPosts(requesterId, username) {
    if (!username) {
        throw new BadRequestError('Username is required');
    }

    const user = await prisma.user.findUnique({
        where: { username },
    });

    if (!user) {
        throw new NotFoundError('User not found');
    }

    const currentRelation = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId: requesterId,
                followingId: user.id
            }
        }
    });

    if (requesterId !== user.id && (!currentRelation || currentRelation?.status === 'PENDING')) {
        return await prisma.post.findMany({
            where: {
                userId: user.id,
                visibility: 'PUBLIC'
            },
            select: {
                id: true,
                description: true,
                latitude: true,
                longitude: true,
                visibility: true,
                createdAt: true,
                updatedAt: true,
                photos: {
                    select: {
                        url: true
                    }
                }
            },
        });
    }

    return await prisma.post.findMany({
        where: { userId: user.id },
        select: {
            id: true,
            description: true,
            latitude: true,
            longitude: true,
            visibility: true,
            createdAt: true,
            updatedAt: true,
            photos: {
                select: {
                    url: true
                }
            }
        },
    });
}

export async function getFollowersByUsername(username) {
    if (!username) {
        throw new BadRequestError('Username is required');
    }

    const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true }
    });

    if (!user) {
        throw new NotFoundError('User not found');
    }

    const followers = await prisma.follow.findMany({
        where: {
            followingId: user.id,
            status: 'ACCEPTED'
        },
        include: {
            follower: {
                select: {
                    name: true,
                    username: true,
                    reputation: true,
                    profilePicture: true
                }
            }
        }
    });

    return followers.map(entry => entry.follower);
}

export async function getFollowingsByUsername(username) {
    if (!username) {
        throw new BadRequestError('Username is required');
    }

    const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true }
    });

    if (!user) {
        throw new NotFoundError('User not found');
    }

    const followings = await prisma.follow.findMany({
        where: {
            followerId: user.id,
            status: 'ACCEPTED'
        },
        include: {
            following: {
                select: {
                    name: true,
                    username: true,
                    reputation: true,
                    profilePicture: true
                }
            }
        }
    });

    return followings.map(entry => entry.following);
}

export async function getFollowRequests(userId) {
    const followRequests = await prisma.follow.findMany({
        where: {
            followingId: userId,
            status: 'PENDING'
        },
        select: {
            status: true,
            createdAt: true,
            follower: {
                select: {
                    name: true,
                    username: true,
                    reputation: true,
                    profilePicture: true
                }
            }
        }
    });

    return followRequests;
}

export async function createFollowRequest(followerId, username) {
    if (!username) {
        throw new BadRequestError('Username is required');
    }

    const targetUser = await prisma.user.findUnique({
        where: { username },
        select: { id: true }
    });

    if (!targetUser) {
        throw new NotFoundError('Target user not found');
    }

    if (followerId === targetUser.id) {
        throw new BadRequestError('You cannot follow yourself');
    }

    const currentRelation = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId: followerId,
                followingId: targetUser.id
            }
        }
    });

    if (currentRelation) {
        if (currentRelation.status === 'PENDING')
            throw new ConflictError('Follow request already exists');

        if (currentRelation.status === 'ACCEPTED')
            throw new ConflictError('User already followed');
    }

    const relation = await prisma.follow.create({
        data: {
            followerId: followerId,
            followingId: targetUser.id,
            status: 'PENDING',

        },
        select: {
            followerId: true,
            followingId: true,
            status: true
        }
    });

    return {
        message: `Follow request sent to @${username}`,
        status: relation.status
    };
}

export async function unfollowUserByUsername(followerId, username) {
    if (!username) {
        throw new BadRequestError('Username is required');
    }

    const targetUser = await prisma.user.findUnique({
        where: { username },
        select: { id: true }
    });

    if (!targetUser) {
        throw new NotFoundError('Target user not found');
    }

    if (followerId === targetUser.id) {
        throw new BadRequestError('You cannot unfollow yourself');
    }

    const currentRelation = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId: followerId,
                followingId: targetUser.id
            }
        }
    });

    if (!currentRelation) {
        throw new ConflictError('Target user not followed yet and no follow request was found');
    }

    await prisma.follow.delete({
        where: {
            followerId_followingId: {
                followerId: followerId,
                followingId: targetUser.id
            }
        }
    });

    if (currentRelation.status === 'PENDING') {
        return {
            message: `Follow request to @${username} removed`
        };
    }

    return {
        message: `You are no longer following @${username}`
    };
}

export async function acceptFollowRequest(followedId, username) {
    if (!username) {
        throw new BadRequestError('Username is required');
    }

    const followerUser = await prisma.user.findUnique({
        where: { username },
        select: { id: true }
    });

    if (!followerUser) {
        throw new NotFoundError('User not found');
    }

    const currentRelation = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId: followerUser.id,
                followingId: followedId
            }
        }
    });

    if (!currentRelation) {
        throw new NotFoundError('Follow request does not exist');
    }

    if (currentRelation.status === 'ACCEPTED') {
        throw new ConflictError('User already follows you');
    }

    const newRelation = await prisma.follow.update({
        where: {
            followerId_followingId: {
                followerId: followerUser.id,
                followingId: followedId
            }
        },
        data: { status: 'ACCEPTED', },
        select: {
            status: true
        }
    });

    return {
        message: `Follow request from @${username} accepted`,
        status: newRelation.status
    };
}

export async function rejectFollowRequest(followedId, username) {
    if (!username) {
        throw new BadRequestError('Username is required');
    }

    const followerUser = await prisma.user.findUnique({
        where: { username },
        select: { id: true }
    });

    if (!followerUser) {
        throw new NotFoundError('User not found');
    }

    const currentRelation = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId: followerUser.id,
                followingId: followedId
            }
        }
    });

    if (!currentRelation) {
        throw new NotFoundError('Follow request does not exist');
    }

    if (currentRelation.status === 'ACCEPTED') {
        throw new ConflictError('Request already accepted');
    }

    await prisma.follow.delete({
        where: {
            followerId_followingId: {
                followerId: followerUser.id,
                followingId: followedId
            }
        }
    });

    return {
        message: `Follow request from @${username} rejected`
    };
}

export async function removeFollower(followedId, username) {
    if (!username) {
        throw new BadRequestError('Username is required');
    }

    const followerUser = await prisma.user.findUnique({
        where: { username },
        select: { id: true }
    });

    if (!followerUser) {
        throw new NotFoundError('User not found');
    }

    const currentRelation = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId: followerUser.id,
                followingId: followedId
            }
        }
    });

    if (!currentRelation) {
        throw new NotFoundError('Follow request does not exist');
    }

    if (currentRelation.status === 'PENDING') {
        throw new ConflictError('Request not accepted yet');
    }

    await prisma.follow.delete({
        where: {
            followerId_followingId: {
                followerId: followerUser.id,
                followingId: followedId
            }
        }
    });

    return {
        message: `@${username} does not follow you anymore`
    };
}

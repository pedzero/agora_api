import { prisma } from '../../lib/prisma.js';
import { deleteImage, uploadImage } from '../../lib/upload.js';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../utils/errors.js';
import { getFileNameFromURL } from '../../utils/filename.js';

export async function getPostById(requesterId, postId) {
    const post = await prisma.post.findUnique({
        where: { id: postId },
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

    if (!post) {
        throw new NotFoundError('Post not found');
    }

    if (post.visibility === 'PRIVATE') {
        const currentRelation = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: requesterId,
                    followingId: post.userId
                }
            }
        });

        if (!currentRelation || currentRelation?.status !== 'ACCEPTED') {
            throw new UnauthorizedError('Access denied. This post is private');
        }
    }

    return post;
}

export async function getFeedForAuthenticatedUser({ userId, page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;

    // followed users
    const followedUsers = await prisma.follow.findMany({
        where: {
            followerId: userId,
            status: 'ACCEPTED',
        },
        select: { followingId: true },
    });

    const followedIds = followedUsers.map(f => f.followingId);

    // followed users posts
    const followedPosts = await prisma.post.findMany({
        where: {
            userId: { in: followedIds },
        },
        select: { 
            id: true,
            description: true,
            latitude: true,
            longitude: true,
            visibility: true,
            createdAt: true,
            updatedAt: true,
            user: {
                select: {
                    username: true,
                    name: true,
                    profilePicture: true,
                },
            },
            photos: {
                select: {
                    url: true
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
    });

    if (followedPosts.length >= limit) {
        return followedPosts;
    }

    // search for more public posts when needed
    const remaining = limit - followedPosts.length;
    const excludedPostIds = followedPosts.map(p => p.id);

    const publicPosts = await prisma.post.findMany({
        where: {
            userId: { notIn: followedIds.concat(userId) },
            id: { notIn: excludedPostIds },
            visibility: 'PUBLIC',
        },
        select: { 
            id: true,
            description: true,
            latitude: true,
            longitude: true,
            visibility: true,
            createdAt: true,
            updatedAt: true,
            user: {
                select: {
                    username: true,
                    name: true,
                    profilePicture: true,
                },
            },
            photos: {
                select: {
                    url: true
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: remaining,
    });

    return [...followedPosts, ...publicPosts];
}

export async function getPublicFeed() {
    return prisma.post.findMany({
        where: {
            visibility: 'PUBLIC',
        },
        select: { 
            id: true,
            description: true,
            latitude: true,
            longitude: true,
            visibility: true,
            createdAt: true,
            updatedAt: true,
            user: {
                select: {
                    username: true,
                    name: true,
                    profilePicture: true,
                },
            },
            photos: {
                select: {
                    url: true
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
    });
}

export async function createPost({ userId, description, latitude, longitude, visibility, files }) {
    if (!files || files.length === 0) {
        return UnauthorizedError('At least one photo must be uploaded.');
    }

    if (files.length > 3) {
        return UnauthorizedError('You can upload up to 3 photos per post.');
    }

    const uploadedPhotos = [];

    for (const file of files) {
        const url = await uploadImage(file);

        uploadedPhotos.push(url);
    }

    const post = await prisma.post.create({
        data: {
            description,
            latitude,
            longitude,
            visibility,
            user: {
                connect: { id: userId }
            },
            photos: {
                create: uploadedPhotos.map((url) => ({
                    url
                }))
            }
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
        }
    });

    return post;
}

export async function updatePost({ userId, postId, description, visibility, removePhotos = [], files = [] }) {
    const post = await prisma.post.findUnique({
        where: { id: postId },
        include: { photos: true },
    });

    if (!post) throw new NotFoundError('Post not found');
    if (post.userId !== userId) throw new UnauthorizedError('Post does not belong to the requester');

    const existingPhotoUrls = post.photos.map((photo) => photo.url);

    // check if photos to remove belong to the post
    for (const photoUrl of removePhotos) {
        if (!existingPhotoUrls.includes(photoUrl)) {
            throw new UnauthorizedError('One or more photos to be removed do not belong to this post');
        }
    }

    const photosAfterUpdate = existingPhotoUrls.length - removePhotos.length + files.length;
    if (photosAfterUpdate > 3) {
        throw new UnauthorizedError('Cannot have more than 3 photos in a post');
    }

    // delete photos from MinIO and database
    for (const photoUrl of removePhotos) {
        const filename = getFileNameFromURL(photoUrl);
        await deleteImage(filename);
    }

    await prisma.photo.deleteMany({
        where: {
            postId,
            url: { in: removePhotos },
        },
    });

    // upload new photos
    const uploadedPhotoUrls = [];
    for (const file of files) {
        const url = await uploadImage(file);
        uploadedPhotoUrls.push(url);
    }

    // update post
    const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
            description,
            visibility,
            photos: {
                create: uploadedPhotoUrls.map((url) => ({ url })),
            },
        },
        select: { 
            id: true,
            description: true,
            latitude: true,
            longitude: true,
            visibility: true,
            createdAt: true,
            updatedAt: true,
            user: {
                select: {
                    username: true,
                    name: true,
                    profilePicture: true,
                },
            },
            photos: {
                select: {
                    url: true
                }
            }
        },
    });

    return updatedPost;
}

export async function deletePost(userId, postId) {
    const post = await prisma.post.findUnique({
        where: { id: postId },
        include: { photos: true },
    });

    if (!post) {
        throw new NotFoundError('Post not found');
    }

    if (post.userId !== userId) {
        throw new ConflictError('You are not the owner of this post');
    }

    const photosUrl = post.photos.map((photo) => photo.url);

    for (const url of photosUrl) {
        const filename = getFileNameFromURL(url);
        await deleteImage(filename);
    }

    await prisma.post.delete({
        where: { id: postId }
    });

    return { message: 'Post deleted successfully' };
}

export async function upvotePost(userId, postId) {
    const post = await prisma.post.findUnique({
        where: { id: postId },
        include: { user: true },
    });

    if (!post) {
        throw new NotFoundError('Post not found');
    }

    const hasAccess = await canUserAccessPost(userId, post);
    if (!hasAccess) {
        throw new UnauthorizedError('Access denied')
    }

    const existingVote = await prisma.vote.findUnique({
        where: {
            userId_postId: {
                userId,
                postId: post.id,
            },
        },
    });

    if (existingVote?.type === 'UP') {
        throw new ConflictError('Post already upvoted');
    }

    const tx = [];

    if (!existingVote) {
        tx.push(
            prisma.vote.create({
                data: { userId, postId: post.id, type: 'UP' },
            }),
            prisma.post.update({
                where: { id: post.id },
                data: { reputation: { increment: 1 } },
            })
        );

        if (userId !== post.userId) {
            tx.push(
                prisma.user.update({
                    where: { id: post.userId },
                    data: { reputation: { increment: 1 } },
                })
            );
        }

        await prisma.$transaction(tx);
        return { message: 'Post upvoted' };
    }

    if (existingVote.type === 'DOWN') {
        tx.push(
            prisma.vote.update({
                where: { id: existingVote.id },
                data: { type: 'UP' },
            }),
            prisma.post.update({
                where: { id: post.id },
                data: { reputation: { increment: 2 } },
            })
        );

        if (userId !== post.userId) {
            tx.push(
                prisma.user.update({
                    where: { id: post.userId },
                    data: { reputation: { increment: 1 } },
                })
            );
        }

        await prisma.$transaction(tx);
        return { message: 'Vote changed to upvote' };
    }
}

export async function downvotePost(userId, postId) {
    const post = await prisma.post.findUnique({
        where: { id: postId },
        include: { user: true },
    });

    if (!post) {
        throw new NotFoundError('Post not found');
    }

    const hasAccess = await canUserAccessPost(userId, post);
    if (!hasAccess) {
        throw new UnauthorizedError('Access denied')
    }

    const existingVote = await prisma.vote.findUnique({
        where: {
            userId_postId: {
                userId,
                postId: post.id,
            },
        },
    });

    if (existingVote?.type === 'DOWN') {
        throw new ConflictError('Post already downvoted');
    }

    const tx = [];

    if (!existingVote) {
        tx.push(
            prisma.vote.create({
                data: { userId, postId: post.id, type: 'DOWN' },
            }),
            prisma.post.update({
                where: { id: post.id },
                data: { reputation: { decrement: 1 } },
            })
        );

        await prisma.$transaction(tx);
        return { message: 'Post downvoted' };
    }

    if (existingVote.type === 'UP') {
        tx.push(
            prisma.vote.update({
                where: { id: existingVote.id },
                data: { type: 'DOWN' },
            }),
            prisma.post.update({
                where: { id: post.id },
                data: { reputation: { decrement: 2 } },
            })
        );

        if (userId !== post.userId) {
            tx.push(
                prisma.user.update({
                    where: { id: post.userId },
                    data: { reputation: { decrement: 1 } },
                })
            );
        }

        await prisma.$transaction(tx);
        return { message: 'Vote changed to downvote' };
    }
}

export async function removeVote(userId, postId) {
    const post = await prisma.post.findUnique({
        where: { id: postId },
        include: { user: true },
    });

    if (!post) {
        throw new NotFoundError('Post not found');
    }

    const hasAccess = await canUserAccessPost(userId, post);
    if (!hasAccess) {
        throw new UnauthorizedError('Access denied')
    }

    const existingVote = await prisma.vote.findUnique({
        where: {
            userId_postId: {
                userId,
                postId: post.id,
            },
        },
    });

    if (!existingVote) {
        throw new NotFoundError('No existing vote to remove');
    }

    const updates = [];

    updates.push(
        prisma.vote.delete({
            where: { id: existingVote.id },
        })
    );

    if (existingVote.type === 'UP') {
        updates.push(
            prisma.post.update({
                where: { id: post.id },
                data: { reputation: { decrement: 1 } },
            })
        );

        if (userId !== post.userId) {
            updates.push(
                prisma.user.update({
                    where: { id: post.userId },
                    data: { reputation: { decrement: 1 } },
                })
            );
        }
    }

    if (existingVote.type === 'DOWN') {
        updates.push(
            prisma.post.update({
                where: { id: post.id },
                data: { reputation: { increment: 1 } },
            })
        );
    }

    await prisma.$transaction(updates);

    return { message: 'Vote removed' };
}

async function canUserAccessPost(userId, post) {
    if (post.visibility === 'PUBLIC') {
        return true;
    }

    if (userId === post.userId) {
        return true;
    }

    const currentRelation = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId: userId,
                followingId: post.userId
            }
        }
    });

    if (currentRelation?.status === 'ACCEPTED') {
        return true;
    }

    return false;
}
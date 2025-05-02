import { prisma } from '../../lib/prisma.js';
import { deleteImage, uploadImage } from '../../lib/upload.js';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../utils/errors.js';
import { getFileNameFromURL } from '../../utils/filename.js';

export async function getPostById(postId) {
    const post = await prisma.post.findUnique({
        where: { id: postId },
        include: { photos: true },
    });

    if (!post) {
        throw new NotFoundError('Post not found');
    }

    return post;
}

export async function createPost({ userId, description, latitude, longitude, files }) {
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
            user: {
                connect: { id: userId }
            },
            photos: {
                create: uploadedPhotos.map((url) => ({
                    url
                }))
            }
        },
        include: {
            photos: true
        }
    });

    return post;
}

export async function updatePost({ userId, postId, description, removePhotos = [], files = [] }) {
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
            photos: {
                create: uploadedPhotoUrls.map((url) => ({ url })),
            },
        },
        include: { photos: true },
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

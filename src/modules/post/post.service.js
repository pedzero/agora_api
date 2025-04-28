import { prisma } from '../../lib/prisma.js';
import { uploadImage } from '../../lib/upload.js';

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

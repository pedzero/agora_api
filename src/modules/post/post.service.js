import { prisma } from '../../lib/prisma.js';
// import { uploadFileToMinIO } from '@/lib/minio.js';

export async function createPost({ userId, description, latitude, longitude, files }) {
    const uploadedPhotos = [];

    for (const file of files) {
        // const url = await uploadFileToMinIO(file);
        const url = 'fake_path/' + file.originalname;

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

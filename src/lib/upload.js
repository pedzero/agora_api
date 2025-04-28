import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { MINIO_BUCKET_NAME, MINIO_ENDPOINT, MINIO_PORT, MINIO_USE_SSL } from '../config/env.js';
import s3 from './minio.js';
import { AppError } from '../utils/errors.js';

const BUCKET_NAME = MINIO_BUCKET_NAME || 'agora-media';

export async function uploadImage(file) {
    const fileName = `${Date.now()}-${file.originalname}`.replaceAll(' ', '-');

    const params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    try {
        await s3.send(new PutObjectCommand(params));

        const fileUrl = `http${MINIO_USE_SSL === 'true' ? 's' : ''}://${MINIO_ENDPOINT}:${MINIO_PORT}/${BUCKET_NAME}/${fileName}`;
        return fileUrl;
    } catch (error) {
        throw new AppError('Something went wrong. Try again later.', 503);
    }
}

export async function deleteImage(fileName) {
    const params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
    };

    try {
        await s3.send(new DeleteObjectCommand(params));
    } catch (error) {
        throw new AppError('Something went wrong. Try again later.', 503);
    }
}

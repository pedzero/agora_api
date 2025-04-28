import { S3Client } from '@aws-sdk/client-s3';
import { MINIO_USE_SSL, MINIO_ENDPOINT, MINIO_PORT, MINIO_REGION, MINIO_ACCESS_KEY, MINIO_SECRET_KEY } from '../config/env.js';

const s3 = new S3Client({
    endpoint: `http${MINIO_USE_SSL === 'true' ? 's' : ''}://${MINIO_ENDPOINT}:${MINIO_PORT}`,
    region: MINIO_REGION,
    credentials: {
        accessKeyId: MINIO_ACCESS_KEY,
        secretAccessKey: MINIO_SECRET_KEY,
    },
    forcePathStyle: true,
});

export default s3;

import 'dotenv/config';

export const {
  PORT = 3333,
  NODE_ENV = 'development',
  DATABASE_URL,
  JWT_SECRET,
  JWT_EXPIRES_IN = '1h',

  MINIO_ENDPOINT,
  MINIO_PORT,
  MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY,
  MINIO_BUCKET_NAME,
  MINIO_REGION,
  MINIO_USE_SSL,
} = process.env;
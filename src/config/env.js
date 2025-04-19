import 'dotenv/config';

export const {
  PORT = 3333,
  NODE_ENV = 'development',
  DATABASE_URL,
  JWT_SECRET,
  JWT_EXPIRES_IN = '1h'
} = process.env;
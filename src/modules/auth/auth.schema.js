import { z } from 'zod';

export const registerSchema = z.object({
    name: z.string().min(2, 'Name must have at least 2 characters'),
    email: z.string().email('Invalid Email address'),
    password: z.string().min(8, 'Password must have at least 8 characters'),
    username: z.string().min(1, 'Username is required')
});

export const loginSchema = z.object({
    email: z.string().email('Invalid Email address'),
    password: z.string().min(6, 'Password must have at least 8 characters')
});

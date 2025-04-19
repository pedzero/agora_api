import { z } from 'zod';

export const registerSchema = z.object({
    name: z.string().min(2, 'Name must have at least 2 characters'),
    email: z.string().email('Invalid Email address'),
    password: z.string().min(6, 'Password must have at least 8 characters')
});

export const loginSchema = z.object({
    email: z.string().email('Invalid Email address'),
    password: z.string().min(6, 'Password must have at least 8 characters')
});

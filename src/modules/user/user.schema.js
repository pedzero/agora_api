import { z } from 'zod';

export const updateSchema = z.object({
    name: z.string().min(2, 'Name must have at least 2 characters').optional(),
    password: z.string().min(8, 'Password must have at least 8 characters').optional(),
    username: z.string().min(1, 'Username is required').optional(),
    profilePicture: z.string().url('Must be a valid URL').optional()
});
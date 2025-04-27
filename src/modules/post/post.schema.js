import { z } from 'zod';

export const createPostSchema = z.object({
    description: z.string().max(500).optional(),
    latitude: z.number({
        required_error: 'Latitude is required',
        invalid_type_error: 'Latitude must be a number'
    }),
    longitude: z.number({
        required_error: 'Longitude is required',
        invalid_type_error: 'Longitude must be a number'
    }),
});

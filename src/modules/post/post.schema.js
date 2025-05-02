import { z } from 'zod';

const visibilitySchema = z.preprocess(
    (value) => {
        if (typeof value === 'string') return value.toUpperCase();
        return value;
    },
    z.enum(['PUBLIC', 'PRIVATE'], {
        required_error: 'Visibility is required',
        invalid_type_error: 'Visibility must be either PUBLIC or PRIVATE',
    })
);

export const createPostSchema = z.object({
    description: z.string().max(500).optional(),

    latitude: z.number({
        required_error: 'Latitude is required',
        invalid_type_error: 'Latitude must be a number',
    }),

    longitude: z.number({
        required_error: 'Longitude is required',
        invalid_type_error: 'Longitude must be a number',
    }),

    visibility: visibilitySchema,
});

export const updatePostSchema = z.object({
    description: z.string().max(500).optional(),

    visibility: visibilitySchema.optional(),

    removePhotos: z
        .preprocess((value) => {
            if (typeof value === 'string') return [value];
            if (Array.isArray(value)) return value;
            return [];
        }, z.array(z.string().url('Each photo URL must be valid')).max(3, 'Cannot remove more than 3 photos'))
        .optional(),
});

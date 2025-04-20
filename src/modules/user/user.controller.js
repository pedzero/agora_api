import { updateSchema } from './user.schema.js';
import * as UserService from './user.service.js';

export async function getOwnProfile(request, response, next) {
    try {
        const userId = request.user.id;
        const profile = await UserService.getOwnProfile(userId);
        response.json({ user: profile });
    } catch (error) {
        return next(error);
    }
}

export async function updateOwnProfile(request, response, next) {
    try {
        const userId = request.user.id;
        const validatedData = updateSchema.parse(request.body);

        const updatedUser = await UserService.updateOwnProfile(userId, validatedData);
        return response.status(200).json({ user: updatedUser });
    } catch (error) {
        if (error.name === 'ZodError') {
            return response.status(400).json({ errors: error.errors });
        }
        return next(error);
    }
}

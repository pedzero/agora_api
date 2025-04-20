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

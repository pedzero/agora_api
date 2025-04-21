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

export async function deleteOwnProfile(request, response, next) {
    try {
        const userId = request.user.id;
        const result = await UserService.deleteOwnProfile(userId);
        return response.status(200).json(result);
    } catch (error) {
        return next(error);
    }
}

export async function searchUsers(request, response, next) {
    try {
        const { username } = request.query;

        const users = await UserService.searchUsersByUsername(username);
        return response.json({ users });

    } catch (error) {
        next(error);
    }
}

export async function getFollowers(request, response, next) {
    try {
        const { username } = request.params;
        const followers = await UserService.getFollowersByUsername(username);
        return response.json({ followers });
    } catch (error) {
        return next(error);
    }
}

export async function getFollowings(request, response, next) {
    try {
        const { username } = request.params;
        const followings = await UserService.getFollowingsByUsername(username);
        return response.json({ followings });
    } catch (error) {
        return next(error);
    }
}

export async function follow(request, response, next) {
    try {
        const { username } = request.params;
        const userId = request.user.id;
        const result = await UserService.followUserByUsername(userId, username);
        return response.json(result);
    } catch (error) {
        return next(error);
    }
}

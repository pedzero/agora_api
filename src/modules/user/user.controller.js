import { getTokenFromHeader } from '../../utils/token.js';
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
        validatedData.profilePicture = request.file;

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
        const token = getTokenFromHeader(request);
        const result = await UserService.deleteOwnProfile(userId, token);
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

export async function getUser(request, response, next) {
    try {
        const { username } = request.params;

        const user = await UserService.getUserByUsername(username);
        return response.json({ user });
    } catch (error) {
        next(error);
    }
}

export async function getUserPosts(request, response, next) {
    try {
        const { username } = request.params;

        const posts = await UserService.getUserPosts(username);
        return response.json({ posts });
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

export async function getFollowRequests(request, response, next) {
    try {
        const userId = request.user.id;

        const followRequests = await UserService.getFollowRequests(userId);
        return response.json({ followRequests });
    } catch (error) {
        return next(error);
    }
}

export async function follow(request, response, next) {
    try {
        const { username } = request.params;
        const userId = request.user.id;

        const result = await UserService.createFollowRequest(userId, username);
        return response.json(result);
    } catch (error) {
        return next(error);
    }
}

export async function unfollow(request, response, next) {
    try {
        const { username } = request.params;
        const userId = request.user.id;
        
        const result = await UserService.unfollowUserByUsername(userId, username);
        return response.json(result);
    } catch (error) {
        return next(error);
    }
}

export async function acceptFollowRequest(request, response, next) {
    try {
        const { username } = request.params;
        const userId = request.user.id;

        const result = await UserService.acceptFollowRequest(userId, username);
        return response.json(result);
    } catch (error) {
        return next(error);
    }
}

export async function rejectFollowRequest(request, response, next) {
    try {
        const { username } = request.params;
        const userId = request.user.id;

        const result = await UserService.rejectFollowRequest(userId, username);
        return response.json(result);
    } catch (error) {
        return next(error);
    }
}

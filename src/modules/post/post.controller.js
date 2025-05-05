import { createPostSchema, updatePostSchema } from './post.schema.js';
import * as PostService from './post.service.js';

export async function getPost(request, response, next) {
    try {
        const userId = request.user.id;
        const { postId } = request.params;

        const post = await PostService.getPostById(userId, postId);
        response.status(200).json(post);
    } catch (error) {
        next(error);
    }
}

export async function feed(request, response, next) {
    try {
        const userId = request.user?.id;
        const { page = 1, limit = 10 } = request.query;

        let posts;
        if (userId) {
            posts = await PostService.getFeedForAuthenticatedUser({
                userId,
                page: Number(page),
                limit: Number(limit),
            });
        } else {
            posts = await PostService.getPublicFeed();
        }
        response.json(posts);
    } catch (error) {
        next(error);
    }
}

export async function createPost(request, response, next) {
    try {
        const data = createPostSchema.parse(request.body);

        data.userId = request.user.id;
        data.files = request.files;

        const post = await PostService.createPost(data);
        response.status(201).json(post);
    } catch (error) {
        next(error);
    }
}

export async function updatePost(request, response, next) {
    try {
        const data = updatePostSchema.parse(request.body);
        const { postId } = request.params;

        data.userId = request.user.id;
        data.postId = postId
        data.files = request.files;

        const post = await PostService.updatePost(data);
        response.status(201).json(post);
    } catch (error) {
        next(error);
    }
}

export async function deletePost(request, response, next) {
    try {
        const userId = request.user.id;
        const { postId } = request.params;

        const message = await PostService.deletePost(userId, postId);
        response.status(200).json(message);
    } catch (error) {
        next(error);
    }
}

export async function upvotePost(request, response, next) {
    try {
        const { postId } = request.params;
        const userId = request.user.id;

        const message = await PostService.upvotePost(userId, postId);
        response.status(201).json(message);
    } catch (error) {
        next(error);
    }
}

export async function downvotePost(request, response, next) {
    try {
        const { postId } = request.params;
        const userId = request.user.id;

        const message = await PostService.downvotePost(userId, postId);
        response.status(201).json(message);
    } catch (error) {
        next(error);
    }
}

export async function removeVote(request, response, next) {
    try {
        const { postId } = request.params;
        const userId = request.user.id;

        const message = await PostService.removeVote(userId, postId);
        response.status(200).json(message);
    } catch (error) {
        next(error);
    }
}

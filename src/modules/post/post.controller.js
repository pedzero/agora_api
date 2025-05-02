import { createPostSchema, updatePostSchema } from './post.schema.js';
import * as PostService from './post.service.js';
import { z } from 'zod';

export async function getPost(request, response, next) {
    try {
        const postId = request.params.postId;

        const post = await PostService.getPostById(postId);
        response.status(200).json(post);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return response.status(400).json({ errors: error.errors });
        }
        next(error);
    }
}

export async function createPost(request, response, next) {
    try {
        request.body.latitude = parseFloat(request.body.latitude);
        request.body.longitude = parseFloat(request.body.longitude);

        const data = createPostSchema.parse(request.body);
        data.userId = request.user.id;

        if (!request.files || request.files.length === 0) {
            return response.status(400).json({ error: 'At least one photo must be uploaded.' });
        }

        if (request.files.length > 3) {
            return res.status(400).json({ error: 'You can upload up to 3 photos per post.' });
        }

        data.files = request.files;

        const post = await PostService.createPost(data);
        response.status(201).json(post);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return response.status(400).json({ errors: error.errors });
        }
        next(error);
    }
}

export async function updatePost(request, response, next) {
    try {
        const data = updatePostSchema.parse(request.body);
        data.userId = request.user.id;
        data.postId = request.params.postId;
        data.files = request.files;

        const post = await PostService.updatePost(data);
        response.status(201).json(post);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return response.status(400).json({ errors: error.errors });
        }
        next(error);
    }
}

export async function deletePost(request, response, next) {
    try {
        const userId = request.user.id;
        const postId = request.params.postId;

        const message = await PostService.deletePost(userId, postId);
        response.status(200).json(message);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return response.status(400).json({ errors: error.errors });
        }
        next(error);
    }
}

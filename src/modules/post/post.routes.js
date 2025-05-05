import { Router } from 'express';
import multer from 'multer';
import { authenticate, optionalAuth } from '../../middlewares/auth.js';
import * as PostController from './post.controller.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * GET /posts/feed
 * @summary Fetch latest posts based on user preferences
 * @tags Posts
 * @security bearerAuth | none
 * @return {object} 200 - Feed fetched successfully
 * @return {object} 401 - Invalid or missing authentication token
 */
router.get('/feed', optionalAuth, PostController.feed);

/**
 * GET /posts/{postId}
 * @summary Fetch post data by id
 * @tags Posts
 * @param {string} path.postId.required - Post ID
 * @security bearerAuth
 * @return {object} 200 - Feed fetched successfully
 * @return {object} 401 - Invalid or missing authentication token or Access denied
 * @return {object} 404 - Post not found
 */
router.get('/:postId', authenticate, PostController.getPost);

/**
 * A CreatePostPayload
 * @typedef {object} CreatePostPayload
 * @property {string} description.optional     - Post description
 * @property {number} latitude.required        - Latitude
 * @property {number} longitude.required       - Longitute
 * @property {string} visibility.required      - enum:PUBLIC,PRIVATE - Post visibility
 * @property {string} photos                   - Post photos (Min. 1, Max. 3) - binary
 */

/**
 * POST /posts/
 * @summary Create new post
 * @tags Posts
 * @param {CreatePostPayload} request.body.required - Post data and photos - multipart/form-data
 * @security bearerAuth
 * @return {object} 201 - Post created successfully
 * @return {object} 400 - Invalid or missing required data
 * @return {object} 401 - Invalid or missing authentication token or Photo limit not respected
 */
router.post('/', authenticate, upload.array('photos'), PostController.createPost);

/**
 * A UpdatePostPayload
 * @typedef {object} UpdatePostPayload
 * @property {string} description.optional          - Post description
 * @property {string} visibility.optional           - enum:PUBLIC,PRIVATE - Post visibility
 * @property {array<string>} removePhotos.optional  - Photo URLs to delete
 * @property {string} photos.optional               - Photos to add - binary
 */

/**
 * PATCH /posts/{postId}
 * @summary Update a post data
 * @tags Posts
 * @param {string} path.postId.required - Post ID
 * @param {UpdatePostPayload} request.body.required - Post data and photos - multipart/form-data
 * @security bearerAuth
 * @return {object} 201 - Post patched successfully
 * @return {object} 400 - Invalid data
 * @return {object} 401 - Invalid or missing authentication token or Post to not belongs to requester or Photo limit not respected
 * @return {object} 404 - Post not found
 */
router.patch('/:postId', authenticate, upload.array('photos'), PostController.updatePost);

/**
 * DELETE /posts/{postId}
 * @summary Delete a post
 * @tags Posts
 * @param {string} path.postId.required - Post ID
 * @security bearerAuth
 * @return {object} 200 - Post deleted successfully
 * @return {object} 401 - Invalid or missing authentication token or Post to not belongs to requester
 * @return {object} 404 - Post not found
 */
router.delete('/:postId', authenticate, PostController.deletePost);

export default router;

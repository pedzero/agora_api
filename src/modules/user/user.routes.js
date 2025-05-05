import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../../middlewares/auth.js';
import * as UserController from './user.controller.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * GET /users/me
 * @summary Fetch own user data
 * @tags Users
 * @security bearerAuth
 * @return {object} 200 - User data fetched successfully
 * @return {object} 401 - Invalid or missing authentication token
 * @return {object} 404 - User not found
 */
router.get('/me', authenticate, UserController.getOwnProfile);

/**
 * A UpdateUserPayload
 * @typedef {object} UpdateUserPayload
 * @property {string} name.optional             - Full name
 * @property {number} username.optional         - Username
 * @property {number} password.optional         - Password
 * @property {string} profilePicture.optional   - Profile picture - binary       
 */

/**
 * PATCH /users/me
 * @summary Update user data
 * @tags Users
 * @param {UpdateUserPayload} request.body.required - User data - multipart/form-data
 * @security bearerAuth
 * @return {object} 201 - User patched successfully
 * @return {object} 400 - Invalid data
 * @return {object} 401 - Invalid or missing authentication token or Username already taken
 */
router.patch('/me', authenticate, upload.single('profilePicture'), UserController.updateOwnProfile);

/**
 * DELETE /users/me
 * @summary Delete own profile
 * @tags Users
 * @security bearerAuth
 * @return {object} 200 - User deleted successfully
 * @return {object} 401 - Invalid or missing authentication token
 * @return {object} 404 - User not found
 */
router.delete('/me', authenticate, UserController.deleteOwnProfile);

/**
 * GET /users/me/follow-requests
 * @summary Fetch user follow requests
 * @tags Users
 * @security bearerAuth
 * @return {object} 200 - Follow requests fetched successfully
 * @return {object} 401 - Invalid or missing authentication token
 */
router.get('/me/follow-requests', authenticate, UserController.getFollowRequests);

/**
 * GET /users/search
 * @summary Search for users containing query in their username
 * @tags Users
 * @param {string} username.query.required - Username to search for
 * @security bearerAuth
 * @return {object} 200 - Users fetched successfully
 * @return {object} 401 - Invalid or missing authentication token
 */
router.get('/search', authenticate, UserController.searchUsers);

/**
 * GET /users/{username}
 * @summary Fetch user data by username
 * @tags Users
 * @param {string} path.username.required - Username
 * @security bearerAuth
 * @return {object} 200 - User data fetched successfully
 * @return {object} 401 - Invalid or missing authentication token
 * @return {object} 404 - User not found
 */
router.get('/:username', authenticate, UserController.getUser);

/**
 * GET /users/{username}/posts
 * @summary Fetch user posts by username
 * @tags Users
 * @param {string} path.username.required - Username
 * @security bearerAuth
 * @return {object} 200 - User posts fetched successfully
 * @return {object} 401 - Invalid or missing authentication token
 * @return {object} 404 - User not found
 */
router.get('/:username/posts', authenticate, UserController.getUserPosts);

/**
 * GET /users/{username}/followers
 * @summary Fetch user followers by username
 * @tags Users
 * @param {string} path.username.required - Username
 * @security bearerAuth
 * @return {object} 200 - User followers fetched successfully
 * @return {object} 401 - Invalid or missing authentication token
 * @return {object} 404 - User not found
 */
router.get('/:username/followers', authenticate, UserController.getFollowers);

/**
 * GET /users/{username}/followings
 * @summary Fetch who a user follows by username
 * @tags Users
 * @param {string} path.username.required - Username
 * @security bearerAuth
 * @return {object} 200 - User followings fetched successfully
 * @return {object} 401 - Invalid or missing authentication token
 * @return {object} 404 - User not found
 */
router.get('/:username/followings', authenticate, UserController.getFollowings);

/**
 * POST /users/{username}/follow
 * @summary Send a follow request by username
 * @tags Users
 * @param {string} path.username.required - Username
 * @security bearerAuth
 * @return {object} 201 - Follow request sent successfully
 * @return {object} 400 - Not able to follow yourself
 * @return {object} 401 - Invalid or missing authentication token
 * @return {object} 404 - User not found
 * @return {object} 409 - Follow request already exists or User already followed
 */
router.post('/:username/follow', authenticate, UserController.follow);

/**
 * DELETE /users/{username}/unfollow
 * @summary Cancel a follow request or unfollow by username
 * @tags Users
 * @param {string} path.username.required - Username
 * @security bearerAuth
 * @return {object} 200 - User unfollowed successfully
 * @return {object} 400 - Not able to unfollow yourself
 * @return {object} 401 - Invalid or missing authentication token
 * @return {object} 404 - User not found
 * @return {object} 409 - Follow request does not exists or User not followed
 */
router.delete('/:username/unfollow', authenticate, UserController.unfollow);

/**
 * POST /users/{username}/follow-requests/accept
 * @summary Accept a follow request by username
 * @tags Users
 * @param {string} path.username.required - Username
 * @security bearerAuth
 * @return {object} 201 - Follow request accepted successfully
 * @return {object} 401 - Invalid or missing authentication token
 * @return {object} 404 - User not found or Follow request does not exist
 * @return {object} 409 - User already follows you
 */
router.post('/:username/follow-requests/accept', authenticate, UserController.acceptFollowRequest);

/**
 * DELETE /users/{username}/follow-requests/reject
 * @summary Reject a follow request by username
 * @tags Users
 * @param {string} path.username.required - Username
 * @security bearerAuth
 * @return {object} 201 - Follow request rejected successfully
 * @return {object} 401 - Invalid or missing authentication token
 * @return {object} 404 - User not found or Follow request does not exist
 * @return {object} 409 - User already follows you
 */
router.delete('/:username/follow-requests/reject', authenticate, UserController.rejectFollowRequest);

/**
 * DELETE /users/{username}/followers
 * @summary Remove a follower by username
 * @tags Users
 * @param {string} path.username.required - Username
 * @security bearerAuth
 * @return {object} 201 - Follower removed successfully
 * @return {object} 401 - Invalid or missing authentication token
 * @return {object} 404 - User not found or User does not follow you
 * @return {object} 409 - Follow request not accepted yet
 */
router.delete('/:username/followers', authenticate, UserController.removeFollower);

export default router;

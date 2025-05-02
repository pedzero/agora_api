import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../../middlewares/auth.js';
import * as UserController from './user.controller.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/me', authenticate, UserController.getOwnProfile);
router.patch('/me', authenticate, upload.single('profilePicture'), UserController.updateOwnProfile);
router.delete('/me', authenticate, UserController.deleteOwnProfile);
router.get('/me/follow-requests', authenticate, UserController.getFollowRequests);

router.get('/search', authenticate, UserController.searchUsers);
router.get('/:username', authenticate, UserController.getUser);

router.post('/:username/follow', authenticate, UserController.follow);
router.post('/:username/follow-requests/accept', authenticate, UserController.acceptFollowRequest);

//router.get('/:username/posts', authenticate, UserController.getUserPosts);
//router.get('/:username/followers', authenticate, UserController.getFollowers);
//router.get('/:username/followings', authenticate, UserController.getFollowings);

//router.delete('/:username/follow', authenticate, UserController.unfollow);

export default router;

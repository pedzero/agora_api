import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import * as UserController from './user.controller.js';

const router = Router();

router.get('/me', authenticate, UserController.getOwnProfile);
router.patch('/me', authenticate, UserController.updateOwnProfile);
router.delete('/me', authenticate, UserController.deleteOwnProfile);

router.get('/search', authenticate, UserController.searchUsers);

router.get('/:username/followers', authenticate, UserController.getFollowers);
router.get('/:username/followings', authenticate, UserController.getFollowings);
router.post('/:username/follow', authenticate, UserController.follow);

// DELETE /users/:username/follow

export default router;

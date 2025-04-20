import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import * as UserController from './user.controller.js';

const router = Router();

router.get('/me', authenticate, UserController.getOwnProfile);
router.patch('/me', authenticate, UserController.updateOwnProfile);
router.delete('/me', authenticate, UserController.deleteOwnProfile);

router.get('/search', authenticate, UserController.searchUsers);

export default router;

import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import * as UserController from './user.controller.js';

const router = Router();

router.get('/me', authenticate, UserController.getOwnProfile);
//update
//delete

export default router;

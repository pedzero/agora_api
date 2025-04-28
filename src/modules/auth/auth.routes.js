import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../../middlewares/auth.js';
import * as AuthController from './auth.controller.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/register', upload.single('profilePicture'), AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', authenticate, AuthController.logout);

export default router;

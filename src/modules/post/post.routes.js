import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../../middlewares/auth.js';
import * as PostController from './post.controller.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET      /users/:username/posts

// GET      /:postId
// GET      /feed
router.post('/', authenticate, upload.array('photos'), PostController.createPost);
router.patch('/:postId', authenticate, upload.array('photos'), PostController.updatePost);
// DELETE   /:postId

export default router;

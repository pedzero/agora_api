import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../../middlewares/auth.js';
import * as PostController from './post.controller.js';

const router = Router();
const upload = multer();

// GET      /users/:username/posts

// GET      /:postId
// GET      /feed
router.post('/', authenticate, upload.array('photos'), PostController.createPost);
// PATCH    /:postId
// DELETE   /:postId

export default router;

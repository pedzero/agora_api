import { Router } from 'express';
import postRoutes from './post.routes.js';

const postModule = Router();

postModule.use('/posts', postRoutes);

export default postModule;
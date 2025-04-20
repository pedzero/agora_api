import { Router } from 'express';
import userRoutes from './user.routes.js';

const userModule = Router();

userModule.use('/users', userRoutes);

export default userModule;
import { Router } from 'express';
import authRoutes from './auth.routes.js';

const authModule = Router();

authModule.use('/auth', authRoutes);

export default authModule;

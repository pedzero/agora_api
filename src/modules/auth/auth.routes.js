import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../../middlewares/auth.js';
import * as AuthController from './auth.controller.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * A RegisterPayload
 * @typedef {object} RegisterPayload
 * @property {string} name.required            - Full name
 * @property {string} email.required           - Email address
 * @property {string} username.required        - Unique username
 * @property {string} password.required        - User password
 * @property {string} profilePicture           - Profile picture - binary
 */

/**
 * POST /auth/register
 * @summary Register a new user
 * @tags Auth
 * @param {RegisterPayload} request.body.required - User data and profile picture - multipart/form-data
 * @return {object} 201 - User created successfully
 * @return {object} 400 - Invalid input data
 * @return {object} 409 - Conflict (email or username already exists)
 */
router.post('/register', upload.single('profilePicture'), AuthController.register);

/**
 * A LoginPayload
 * @typedef {object} LoginPayload
 * @property {string} email.required           - Email address
 * @property {string} password.required        - User password
 */

/**
 * POST /auth/login
 * @summary Login
 * @tags Auth
 * @param {LoginPayload} request.body.required - Login data
 * @return {object} 200 - Successful login
 * @return {object} 401 - Invalid credentials
 */
router.post('/login', AuthController.login);

/**
 * POST /auth/logout
 * @summary Log out the current user by invalidating the JWT token
 * @tags Auth
 * @security bearerAuth
 * @return {object} 200 - Logout successful
 * @return {object} 401 - Invalid or missing authentication token
 */
router.post('/logout', authenticate, AuthController.logout);

export default router;

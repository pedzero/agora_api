import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import expressJSDocSwagger from 'express-jsdoc-swagger';
import { jsdocOptions } from './config/docs.js';

import authModule from './modules/auth/auth.module.js';
import userModule from './modules/user/user.module.js';
import postModule from './modules/post/post.module.js';

import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

expressJSDocSwagger(app)(jsdocOptions);

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// routes
app.use(authModule);
app.use(userModule);
app.use(postModule);

app.use(errorHandler);

export default app;
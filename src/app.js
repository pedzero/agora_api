import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import authModule from './modules/auth/auth.module.js';
import userModule from './modules/user/user.module.js';

import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// routes
app.use(authModule);
app.use(userModule);

app.use(errorHandler);

export default app;
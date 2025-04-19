import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import { loadEnv } from './config/env.js';

import authModule from './modules/auth/auth.module.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();
loadEnv();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// test
app.get('/', (request, response) => {
    response.json({ message: 'Hello, World!' });
});

app.use(authModule);
app.use(errorHandler); 

export default app;
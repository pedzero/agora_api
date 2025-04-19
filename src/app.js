import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import authModule from './modules/auth/auth.module.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { authenticate } from './middlewares/auth.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// test
app.get('/', (request, response) => {
    response.json({ message: 'Hello, World!' });
});

app.get('/protected', authenticate, (req, res) => {
    return res.json({
        message: `Hello, ${req.user.email}`,
    });
});

app.use(authModule);
app.use(errorHandler);

export default app;
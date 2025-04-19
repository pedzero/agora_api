import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import { loadEnv } from './config/env.js';

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

export default app;
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import { registrationRoutes } from './routes/registration.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { Logger } from './utils/logger.js';

const app: express.Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  Logger.http(`${req.method} ${req.url}`);
  next();
});

app.use('/api/v1', registrationRoutes);

app.get('/api/v1/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: config.env,
  });
});

app.use((_req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

app.use(errorHandler);

export { app };

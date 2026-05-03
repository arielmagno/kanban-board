import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from './middleware/error';
import authRoutes from './modules/auth/auth.routes';
import boardRoutes from './modules/board/board.routes';
import laneRoutes from './modules/lane/lane.routes';
import laneStandaloneRoutes from './modules/lane/lane-standalone.routes';
import { cardNestedRouter, cardRouter } from './modules/card/card.routes';

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000', credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());

  app.get('/health', (_req, res) => { res.json({ status: 'ok' }); });

  app.use('/api/auth', authRoutes);
  app.use('/api/boards', boardRoutes);
  app.use('/api/boards/:boardId/lanes', laneRoutes);
  app.use('/api/lanes', laneStandaloneRoutes);
  app.use('/api/lanes/:laneId/cards', cardNestedRouter);
  app.use('/api/cards', cardRouter);

  app.use(errorMiddleware);
  return app;
}

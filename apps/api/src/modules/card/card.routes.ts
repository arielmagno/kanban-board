import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import * as controller from './card.controller';

// Nested: /api/lanes/:laneId/cards
const nestedRouter = Router({ mergeParams: true });
nestedRouter.use(authMiddleware);
nestedRouter.post('/', controller.create);

// Standalone: /api/cards
const router = Router();
router.use(authMiddleware);
router.patch('/move', controller.move);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);

export { nestedRouter as cardNestedRouter, router as cardRouter };

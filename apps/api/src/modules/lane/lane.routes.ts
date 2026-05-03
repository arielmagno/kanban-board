import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import * as controller from './lane.controller';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

// Mounted at /api/boards/:boardId/lanes
router.post('/', controller.create);
router.patch('/reorder', controller.reorder);

export default router;

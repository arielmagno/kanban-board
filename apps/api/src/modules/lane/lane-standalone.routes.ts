import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import * as controller from './lane.controller';

const router = Router();

router.use(authMiddleware);

// Mounted at /api/lanes
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);

export default router;

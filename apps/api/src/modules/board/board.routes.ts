import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import * as controller from './board.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', controller.list);
router.post('/', controller.create);
router.get('/:id', controller.get);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);

export default router;

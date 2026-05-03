import { Request, Response, NextFunction } from 'express';
import { createLaneSchema, updateLaneSchema, reorderLanesSchema } from '@boardflow/shared';
import * as laneService from './lane.service';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = createLaneSchema.parse(req.body);
    const lane = await laneService.createLane(req.user.tenantId, req.params.boardId, dto);
    res.status(201).json(lane);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = updateLaneSchema.parse(req.body);
    const lane = await laneService.updateLane(req.user.tenantId, req.params.id, dto);
    res.json(lane);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await laneService.deleteLane(req.user.tenantId, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function reorder(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = reorderLanesSchema.parse(req.body);
    await laneService.reorderLanes(req.user.tenantId, req.params.boardId, dto);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

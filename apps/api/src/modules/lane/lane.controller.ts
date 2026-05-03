import { Request, Response, NextFunction } from 'express';
import { createLaneSchema, updateLaneSchema, reorderLanesSchema } from '@boardflow/shared';
import * as laneService from './lane.service';
import { emitBoardUpdate } from '../../socket';
import { getBoardIdForLane } from '../card/board-id.helper';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = createLaneSchema.parse(req.body);
    const lane = await laneService.createLane(req.user.tenantId, req.params.boardId, dto);
    res.status(201).json(lane);
    emitBoardUpdate(req.params.boardId);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = updateLaneSchema.parse(req.body);
    const lane = await laneService.updateLane(req.user.tenantId, req.params.id, dto);
    res.json(lane);
    const boardId = await getBoardIdForLane(req.params.id);
    if (boardId) emitBoardUpdate(boardId);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const boardId = await getBoardIdForLane(req.params.id);
    await laneService.deleteLane(req.user.tenantId, req.params.id);
    res.status(204).send();
    if (boardId) emitBoardUpdate(boardId);
  } catch (err) {
    next(err);
  }
}

export async function reorder(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = reorderLanesSchema.parse(req.body);
    await laneService.reorderLanes(req.user.tenantId, req.params.boardId, dto);
    res.status(204).send();
    emitBoardUpdate(req.params.boardId);
  } catch (err) {
    next(err);
  }
}

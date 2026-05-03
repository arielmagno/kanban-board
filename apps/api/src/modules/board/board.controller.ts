import { Request, Response, NextFunction } from 'express';
import { createBoardSchema, updateBoardSchema } from '@boardflow/shared';
import * as boardService from './board.service';
import { emitBoardsUpdate } from '../../socket';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const boards = await boardService.listBoards(req.user.tenantId);
    res.json(boards);
  } catch (err) {
    next(err);
  }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const board = await boardService.getBoard(req.user.tenantId, req.params.id);
    res.json(board);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = createBoardSchema.parse(req.body);
    const board = await boardService.createBoard(req.user.tenantId, req.user.userId, dto);
    res.status(201).json(board);
    emitBoardsUpdate();
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = updateBoardSchema.parse(req.body);
    const board = await boardService.updateBoard(req.user.tenantId, req.params.id, dto);
    res.json(board);
    emitBoardsUpdate();
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await boardService.deleteBoard(req.user.tenantId, req.params.id);
    res.status(204).send();
    emitBoardsUpdate();
  } catch (err) {
    next(err);
  }
}

import { Request, Response, NextFunction } from 'express';
import { createCardSchema, updateCardSchema, moveCardSchema } from '@boardflow/shared';
import * as cardService from './card.service';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = createCardSchema.parse({ ...req.body, laneId: req.params.laneId });
    const card = await cardService.createCard(req.user.tenantId, dto);
    res.status(201).json(card);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = updateCardSchema.parse(req.body);
    const card = await cardService.updateCard(req.user.tenantId, req.params.id, dto);
    res.json(card);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await cardService.deleteCard(req.user.tenantId, req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function move(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = moveCardSchema.parse(req.body);
    const card = await cardService.moveCard(req.user.tenantId, dto);
    res.json(card);
  } catch (err) { next(err); }
}

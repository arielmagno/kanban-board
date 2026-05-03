import { prisma } from '../../prisma/client';
import { ForbiddenError, NotFoundError } from '../../errors';
import type { CreateCardDto, UpdateCardDto, MoveCardDto } from '@boardflow/shared';

async function getCardWithOwnership(cardId: string, tenantId: string) {
  const card = await prisma.card.findFirst({
    where: { id: cardId },
    include: { lane: { include: { board: { select: { id: true, tenantId: true } } } } },
  });
  if (!card) throw new NotFoundError('Card not found');
  if (card.tenantId !== tenantId) throw new ForbiddenError();
  return card;
}

export async function createCard(tenantId: string, dto: CreateCardDto) {
  const lane = await prisma.lane.findFirst({ where: { id: dto.laneId } });
  if (!lane) throw new NotFoundError('Lane not found');
  if (lane.tenantId !== tenantId) throw new ForbiddenError();

  const maxPos = await prisma.card.aggregate({
    where: { laneId: dto.laneId },
    _max: { position: true },
  });
  const position = (maxPos._max.position ?? -1) + 1;

  return prisma.card.create({
    data: { title: dto.title, description: dto.description, position, laneId: dto.laneId, tenantId },
    select: { id: true, title: true, description: true, position: true, laneId: true, createdAt: true, updatedAt: true },
  });
}

export async function updateCard(tenantId: string, cardId: string, dto: UpdateCardDto) {
  await getCardWithOwnership(cardId, tenantId);
  return prisma.card.update({
    where: { id: cardId },
    data: { ...(dto.title && { title: dto.title }), ...(dto.description !== undefined && { description: dto.description }) },
    select: { id: true, title: true, description: true, position: true, laneId: true, createdAt: true, updatedAt: true },
  });
}

export async function deleteCard(tenantId: string, cardId: string) {
  await getCardWithOwnership(cardId, tenantId);
  await prisma.card.delete({ where: { id: cardId } });
}

export async function moveCard(tenantId: string, dto: MoveCardDto) {
  const card = await getCardWithOwnership(dto.cardId, tenantId);

  // Verify target lane belongs to the same board as source lane
  const targetLane = await prisma.lane.findFirst({
    where: { id: dto.toLaneId },
    include: { board: { select: { id: true, tenantId: true } } },
  });
  if (!targetLane) throw new NotFoundError('Target lane not found');
  if (targetLane.tenantId !== tenantId) throw new ForbiddenError();
  if (targetLane.board.id !== card.lane.board.id) {
    throw new ForbiddenError('Cannot move card to a lane in a different board');
  }

  const fromLaneId = card.laneId;
  const toLaneId = dto.toLaneId;
  const toPosition = dto.position;

  return prisma.$transaction(async (tx) => {
    if (fromLaneId === toLaneId) {
      // Same-lane reorder
      const oldPosition = card.position;
      if (oldPosition === toPosition) return card;

      if (toPosition < oldPosition) {
        await tx.card.updateMany({
          where: { laneId: fromLaneId, tenantId, position: { gte: toPosition, lt: oldPosition } },
          data: { position: { increment: 1 } },
        });
      } else {
        await tx.card.updateMany({
          where: { laneId: fromLaneId, tenantId, position: { gt: oldPosition, lte: toPosition } },
          data: { position: { decrement: 1 } },
        });
      }
    } else {
      // Cross-lane move: close gap in source
      await tx.card.updateMany({
        where: { laneId: fromLaneId, tenantId, position: { gt: card.position } },
        data: { position: { decrement: 1 } },
      });
      // Open gap in target
      await tx.card.updateMany({
        where: { laneId: toLaneId, tenantId, position: { gte: toPosition } },
        data: { position: { increment: 1 } },
      });
    }

    return tx.card.update({
      where: { id: dto.cardId },
      data: { laneId: toLaneId, position: toPosition },
      select: { id: true, title: true, description: true, position: true, laneId: true, createdAt: true, updatedAt: true },
    });
  });
}

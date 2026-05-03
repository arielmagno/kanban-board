import { prisma } from '../../prisma/client';

export async function getBoardIdForLane(laneId: string): Promise<string | null> {
  const lane = await prisma.lane.findUnique({
    where: { id: laneId },
    select: { boardId: true },
  });
  return lane?.boardId ?? null;
}

export async function getBoardIdForCard(cardId: string): Promise<string | null> {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    select: { lane: { select: { boardId: true } } },
  });
  return card?.lane.boardId ?? null;
}

import { prisma } from '../../prisma/client';
import { ForbiddenError, NotFoundError } from '../../errors';
import type { CreateLaneDto, UpdateLaneDto, ReorderLanesDto } from '@boardflow/shared';

async function getLaneWithOwnership(laneId: string, tenantId: string) {
  const lane = await prisma.lane.findFirst({
    where: { id: laneId },
    include: { board: { select: { tenantId: true } } },
  });
  if (!lane) throw new NotFoundError('Lane not found');
  if (lane.tenantId !== tenantId) throw new ForbiddenError();
  return lane;
}

export async function createLane(tenantId: string, boardId: string, dto: CreateLaneDto) {
  const board = await prisma.board.findFirst({ where: { id: boardId } });
  if (!board) throw new NotFoundError('Board not found');
  if (board.tenantId !== tenantId) throw new ForbiddenError();

  const maxPos = await prisma.lane.aggregate({
    where: { boardId },
    _max: { position: true },
  });
  const position = (maxPos._max.position ?? -1) + 1;

  return prisma.lane.create({
    data: { title: dto.title, position, boardId, tenantId, isDefault: false },
    select: { id: true, title: true, position: true, isDefault: true },
  });
}

export async function updateLane(tenantId: string, laneId: string, dto: UpdateLaneDto) {
  await getLaneWithOwnership(laneId, tenantId);
  return prisma.lane.update({
    where: { id: laneId },
    data: { title: dto.title },
    select: { id: true, title: true, position: true, isDefault: true },
  });
}

export async function deleteLane(tenantId: string, laneId: string) {
  const lane = await getLaneWithOwnership(laneId, tenantId);
  if (lane.isDefault) throw new ForbiddenError('Default lanes cannot be deleted');
  await prisma.lane.delete({ where: { id: laneId } });
}

export async function reorderLanes(tenantId: string, boardId: string, dto: ReorderLanesDto) {
  const board = await prisma.board.findFirst({ where: { id: boardId } });
  if (!board) throw new NotFoundError('Board not found');
  if (board.tenantId !== tenantId) throw new ForbiddenError();

  await prisma.$transaction(
    dto.orderedIds.map((id, index) =>
      prisma.lane.updateMany({
        where: { id, boardId, tenantId },
        data: { position: index },
      }),
    ),
  );
}

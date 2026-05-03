import { prisma } from '../../prisma/client';
import { ForbiddenError, NotFoundError } from '../../errors';
import type { CreateBoardDto, UpdateBoardDto } from '@boardflow/shared';
import { randomUUID } from 'crypto';

const BOARD_SELECT = {
  id: true,
  title: true,
  color: true,
  tenantId: true,
  createdAt: true,
  lanes: {
    select: {
      id: true,
      title: true,
      position: true,
      isDefault: true,
      cards: {
        select: {
          id: true,
          title: true,
          description: true,
          position: true,
          laneId: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { position: 'asc' as const },
      },
    },
    orderBy: { position: 'asc' as const },
  },
} as const;

export async function listBoards(tenantId: string) {
  return prisma.board.findMany({
    where: { tenantId },
    select: { id: true, title: true, color: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}

export async function getBoard(tenantId: string, boardId: string) {
  const board = await prisma.board.findFirst({
    where: { id: boardId },
    select: { ...BOARD_SELECT, ownerId: true },
  });
  if (!board) throw new NotFoundError('Board not found');
  if (board.tenantId !== tenantId) throw new ForbiddenError();
  return board;
}

export async function createBoard(tenantId: string, ownerId: string, dto: CreateBoardDto) {
  const boardId = randomUUID();

  return prisma.$transaction(async (tx) => {
    const board = await tx.board.create({
      data: { id: boardId, title: dto.title, color: dto.color ?? null, tenantId, ownerId },
      select: { id: true, title: true, color: true, createdAt: true },
    });

    await tx.lane.createMany({
      data: [
        { title: 'To Do', position: 0, isDefault: true, boardId, tenantId },
        { title: 'In Progress', position: 1, isDefault: true, boardId, tenantId },
        { title: 'Done', position: 2, isDefault: true, boardId, tenantId },
      ],
    });

    return board;
  });
}

export async function updateBoard(tenantId: string, boardId: string, dto: UpdateBoardDto) {
  const board = await prisma.board.findFirst({ where: { id: boardId } });
  if (!board) throw new NotFoundError('Board not found');
  if (board.tenantId !== tenantId) throw new ForbiddenError();

  return prisma.board.update({
    where: { id: boardId },
    data: {
      ...(dto.title && { title: dto.title }),
      ...(dto.color !== undefined && { color: dto.color }),
    },
    select: { id: true, title: true, color: true, createdAt: true },
  });
}

export async function deleteBoard(tenantId: string, boardId: string) {
  const board = await prisma.board.findFirst({ where: { id: boardId } });
  if (!board) throw new NotFoundError('Board not found');
  if (board.tenantId !== tenantId) throw new ForbiddenError();

  await prisma.board.delete({ where: { id: boardId } });
}

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchBoards, fetchBoard, createBoard, updateBoard, deleteBoard,
  createLane, deleteLane, reorderLanes,
} from '@/features/board/board.api';
import { createCard, updateCard, deleteCard, moveCard } from '@/features/board/card.api';
import { apiClient } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  setAccessToken: vi.fn(),
  getAccessToken: vi.fn(),
}));

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockPatch = vi.mocked(apiClient.patch);
const mockDelete = vi.mocked(apiClient.delete);

beforeEach(() => {
  mockGet.mockReset();
  mockPost.mockReset();
  mockPatch.mockReset();
  mockDelete.mockReset();
});

// --- Boards ---

describe('fetchBoards', () => {
  it('GETs /api/boards and returns the list', async () => {
    const boards = [{ id: 'b1', title: 'Board 1', color: null, createdAt: '' }];
    mockGet.mockResolvedValue({ data: boards });

    const result = await fetchBoards();

    expect(mockGet).toHaveBeenCalledWith('/api/boards');
    expect(result).toEqual(boards);
  });
});

describe('fetchBoard', () => {
  it('GETs /api/boards/:id and returns the board', async () => {
    const board = { id: 'b1', title: 'Board 1', lanes: [] };
    mockGet.mockResolvedValue({ data: board });

    const result = await fetchBoard('b1');

    expect(mockGet).toHaveBeenCalledWith('/api/boards/b1');
    expect(result).toEqual(board);
  });

  it('propagates 404 errors for missing boards', async () => {
    mockGet.mockRejectedValue({ response: { status: 404 } });

    await expect(fetchBoard('no-such-id')).rejects.toMatchObject({ response: { status: 404 } });
  });

  it('propagates 403 for cross-tenant access', async () => {
    mockGet.mockRejectedValue({ response: { status: 403 } });

    await expect(fetchBoard('other-tenant-board')).rejects.toMatchObject({ response: { status: 403 } });
  });
});

describe('createBoard', () => {
  it('POSTs to /api/boards with the dto and returns created board', async () => {
    const summary = { id: 'b2', title: 'New Board', color: null, isPublic: true, createdAt: '' };
    mockPost.mockResolvedValue({ data: summary });

    const result = await createBoard({ title: 'New Board', isPublic: true });

    expect(mockPost).toHaveBeenCalledWith('/api/boards', { title: 'New Board', isPublic: true });
    expect(result).toEqual(summary);
  });
});

describe('updateBoard', () => {
  it('PATCHes /api/boards/:id with the dto', async () => {
    const summary = { id: 'b1', title: 'Updated', color: null, createdAt: '' };
    mockPatch.mockResolvedValue({ data: summary });

    const result = await updateBoard('b1', { title: 'Updated' });

    expect(mockPatch).toHaveBeenCalledWith('/api/boards/b1', { title: 'Updated' });
    expect(result).toEqual(summary);
  });
});

describe('deleteBoard', () => {
  it('DELETEs /api/boards/:id', async () => {
    mockDelete.mockResolvedValue({ data: undefined });

    await deleteBoard('b1');

    expect(mockDelete).toHaveBeenCalledWith('/api/boards/b1');
  });
});

// --- Lanes ---

describe('createLane', () => {
  it('POSTs to /api/boards/:boardId/lanes', async () => {
    mockPost.mockResolvedValue({ data: { id: 'l1', title: 'New Lane' } });

    await createLane('b1', { title: 'New Lane' });

    expect(mockPost).toHaveBeenCalledWith('/api/boards/b1/lanes', { title: 'New Lane' });
  });
});

describe('deleteLane', () => {
  it('DELETEs /api/lanes/:id', async () => {
    mockDelete.mockResolvedValue({ data: undefined });

    await deleteLane('l1');

    expect(mockDelete).toHaveBeenCalledWith('/api/lanes/l1');
  });
});

describe('reorderLanes', () => {
  it('PATCHes /api/boards/:boardId/lanes/reorder', async () => {
    mockPatch.mockResolvedValue({ data: undefined });

    await reorderLanes('b1', { orderedIds: ['l2', 'l1'] });

    expect(mockPatch).toHaveBeenCalledWith('/api/boards/b1/lanes/reorder', { orderedIds: ['l2', 'l1'] });
  });
});

// --- Cards ---

describe('createCard', () => {
  it('POSTs to /api/lanes/:laneId/cards', async () => {
    const card = { id: 'c1', title: 'Task', position: 0, laneId: 'l1', createdAt: '', updatedAt: '' };
    mockPost.mockResolvedValue({ data: card });

    const result = await createCard('l1', { title: 'Task' });

    expect(mockPost).toHaveBeenCalledWith('/api/lanes/l1/cards', { title: 'Task' });
    expect(result).toEqual(card);
  });
});

describe('updateCard', () => {
  it('PATCHes /api/cards/:id with the dto', async () => {
    const card = { id: 'c1', title: 'Updated', position: 0, laneId: 'l1', createdAt: '', updatedAt: '' };
    mockPatch.mockResolvedValue({ data: card });

    const result = await updateCard('c1', { title: 'Updated' });

    expect(mockPatch).toHaveBeenCalledWith('/api/cards/c1', { title: 'Updated' });
    expect(result).toEqual(card);
  });
});

describe('deleteCard', () => {
  it('DELETEs /api/cards/:id', async () => {
    mockDelete.mockResolvedValue({ data: undefined });

    await deleteCard('c1');

    expect(mockDelete).toHaveBeenCalledWith('/api/cards/c1');
  });
});

describe('moveCard', () => {
  it('PATCHes /api/cards/move with the move dto', async () => {
    const card = { id: 'c1', title: 'Task', position: 0, laneId: 'l2', createdAt: '', updatedAt: '' };
    mockPatch.mockResolvedValue({ data: card });

    const dto = { cardId: 'c1', toLaneId: 'l2', position: 0 };
    const result = await moveCard(dto);

    expect(mockPatch).toHaveBeenCalledWith('/api/cards/move', dto);
    expect(result).toEqual(card);
  });

  it('propagates 403 when moving a card to a lane in another board', async () => {
    mockPatch.mockRejectedValue({ response: { status: 403 } });

    await expect(
      moveCard({ cardId: 'c1', toLaneId: 'lane-in-other-board', position: 0 }),
    ).rejects.toMatchObject({ response: { status: 403 } });
  });
});

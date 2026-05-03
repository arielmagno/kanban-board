import { describe, it, expect, beforeEach } from 'vitest';
import { useBoardStore } from '@/stores/board.store';
import type { Board } from '@/features/board/board.types';

function makeBoard(): Board {
  return {
    id: 'board-1',
    title: 'Test Board',
    color: null,
    tenantId: 'tenant-1',
    createdAt: '2024-01-01T00:00:00.000Z',
    owner: {
      id: 'user-1',
      fullName: 'Test User',
      email: 'test@example.com',
    },
    lanes: [
      {
        id: 'lane-1',
        title: 'Todo',
        position: 0,
        isDefault: true,
        color: '0',
        cards: [
          { id: 'card-1', title: 'Card A', position: 0, laneId: 'lane-1', createdAt: '', updatedAt: '' },
          { id: 'card-2', title: 'Card B', position: 1, laneId: 'lane-1', createdAt: '', updatedAt: '' },
          { id: 'card-3', title: 'Card C', position: 2, laneId: 'lane-1', createdAt: '', updatedAt: '' },
        ],
      },
      {
        id: 'lane-2',
        title: 'In Progress',
        position: 1,
        isDefault: false,
        color: '1',
        cards: [
          { id: 'card-4', title: 'Card D', position: 0, laneId: 'lane-2', createdAt: '', updatedAt: '' },
        ],
      },
    ],
  };
}

describe('useBoardStore', () => {
  beforeEach(() => {
    useBoardStore.setState({ board: null });
  });

  describe('setBoard / snapshot / rollback', () => {
    it('setBoard stores the board', () => {
      const board = makeBoard();
      useBoardStore.getState().setBoard(board);
      expect(useBoardStore.getState().board).toEqual(board);
    });

    it('snapshot() returns a deep clone, not the same reference', () => {
      const board = makeBoard();
      useBoardStore.getState().setBoard(board);

      const snap = useBoardStore.getState().snapshot();
      expect(snap).toEqual(board);
      expect(snap).not.toBe(board);
      expect(snap!.lanes[0].cards).not.toBe(board.lanes[0].cards);
    });

    it('snapshot() returns null when no board is loaded', () => {
      expect(useBoardStore.getState().snapshot()).toBeNull();
    });

    it('rollback restores state to the snapshot', () => {
      const board = makeBoard();
      useBoardStore.getState().setBoard(board);
      const snap = useBoardStore.getState().snapshot();

      // Mutate the board in the store
      useBoardStore.getState().moveCard('card-1', 'lane-1', 'lane-2', 0);
      expect(useBoardStore.getState().board).not.toEqual(board);

      // Rollback
      useBoardStore.getState().rollback(snap);
      expect(useBoardStore.getState().board).toEqual(board);
    });

    it('rollback to null clears the board', () => {
      useBoardStore.getState().setBoard(makeBoard());
      useBoardStore.getState().rollback(null);
      expect(useBoardStore.getState().board).toBeNull();
    });
  });

  describe('moveCard', () => {
    it('does nothing when board is null', () => {
      useBoardStore.getState().moveCard('card-1', 'lane-1', 'lane-2', 0);
      expect(useBoardStore.getState().board).toBeNull();
    });

    it('moves a card between different lanes and renumbers positions', () => {
      useBoardStore.getState().setBoard(makeBoard());
      useBoardStore.getState().moveCard('card-1', 'lane-1', 'lane-2', 0);

      const board = useBoardStore.getState().board!;
      const lane1 = board.lanes.find((l) => l.id === 'lane-1')!;
      const lane2 = board.lanes.find((l) => l.id === 'lane-2')!;

      // card-1 removed from lane-1; card-2 and card-3 renumbered
      expect(lane1.cards.map((c) => c.id)).toEqual(['card-2', 'card-3']);
      expect(lane1.cards[0].position).toBe(0);
      expect(lane1.cards[1].position).toBe(1);

      // card-1 inserted at position 0 in lane-2, card-4 pushed to 1
      expect(lane2.cards.map((c) => c.id)).toEqual(['card-1', 'card-4']);
      expect(lane2.cards[0].position).toBe(0);
      expect(lane2.cards[1].position).toBe(1);
      expect(lane2.cards[0].laneId).toBe('lane-2');
    });

    it('moves a card within the same lane to a later position', () => {
      useBoardStore.getState().setBoard(makeBoard());
      // Move card-1 (position 0) to position 2 within lane-1
      useBoardStore.getState().moveCard('card-1', 'lane-1', 'lane-1', 2);

      const lane1 = useBoardStore.getState().board!.lanes.find((l) => l.id === 'lane-1')!;
      expect(lane1.cards.map((c) => c.id)).toEqual(['card-2', 'card-3', 'card-1']);
      lane1.cards.forEach((c, i) => expect(c.position).toBe(i));
    });

    it('moves a card within the same lane to an earlier position', () => {
      useBoardStore.getState().setBoard(makeBoard());
      // Move card-3 (position 2) to position 0 within lane-1
      useBoardStore.getState().moveCard('card-3', 'lane-1', 'lane-1', 0);

      const lane1 = useBoardStore.getState().board!.lanes.find((l) => l.id === 'lane-1')!;
      expect(lane1.cards.map((c) => c.id)).toEqual(['card-3', 'card-1', 'card-2']);
      lane1.cards.forEach((c, i) => expect(c.position).toBe(i));
    });

    it('leaves state unchanged when cardId does not exist', () => {
      const board = makeBoard();
      useBoardStore.getState().setBoard(board);
      useBoardStore.getState().moveCard('no-such-card', 'lane-1', 'lane-2', 0);

      const afterBoard = useBoardStore.getState().board!;
      // lane-1 still has 3 cards (filter had nothing to remove, toLaneId branch skips insert)
      expect(afterBoard.lanes.find((l) => l.id === 'lane-1')!.cards).toHaveLength(3);
      // lane-2 still has 1 card
      expect(afterBoard.lanes.find((l) => l.id === 'lane-2')!.cards).toHaveLength(1);
    });

    it('leaves lanes not involved in the move untouched', () => {
      useBoardStore.getState().setBoard(makeBoard());
      useBoardStore.getState().moveCard('card-1', 'lane-1', 'lane-2', 0);

      // lane-2 was the target — lane-1 is the source; neither should be "untouched" here.
      // Add a third lane to verify it is not modified.
      const board = makeBoard();
      board.lanes.push({
        id: 'lane-3',
        title: 'Done',
        position: 2,
        isDefault: false,
        color: '2',
        cards: [{ id: 'card-5', title: 'Card E', position: 0, laneId: 'lane-3', createdAt: '', updatedAt: '' }],
      });
      useBoardStore.getState().setBoard(board);
      useBoardStore.getState().moveCard('card-1', 'lane-1', 'lane-2', 0);

      const lane3 = useBoardStore.getState().board!.lanes.find((l) => l.id === 'lane-3')!;
      expect(lane3.cards).toEqual(board.lanes[2].cards);
    });

    it('rollback after a failed mutation fully restores pre-move state', () => {
      const board = makeBoard();
      useBoardStore.getState().setBoard(board);

      // Simulate the optimistic update pattern
      const snap = useBoardStore.getState().snapshot();
      useBoardStore.getState().moveCard('card-1', 'lane-1', 'lane-2', 0);

      // Simulate API failure → rollback
      useBoardStore.getState().rollback(snap);

      const restored = useBoardStore.getState().board!;
      expect(restored.lanes.find((l) => l.id === 'lane-1')!.cards.map((c) => c.id)).toEqual([
        'card-1', 'card-2', 'card-3',
      ]);
      expect(restored.lanes.find((l) => l.id === 'lane-2')!.cards.map((c) => c.id)).toEqual(['card-4']);
    });
  });

  describe('reorderLanes', () => {
    it('does nothing when board is null', () => {
      useBoardStore.getState().reorderLanes(['lane-2', 'lane-1']);
      expect(useBoardStore.getState().board).toBeNull();
    });

    it('reorders lanes and updates their positions', () => {
      useBoardStore.getState().setBoard(makeBoard());
      useBoardStore.getState().reorderLanes(['lane-2', 'lane-1']);

      const board = useBoardStore.getState().board!;
      expect(board.lanes.map((l) => l.id)).toEqual(['lane-2', 'lane-1']);
      expect(board.lanes[0].position).toBe(0);
      expect(board.lanes[1].position).toBe(1);
    });

    it('filters out invalid lane IDs', () => {
      useBoardStore.getState().setBoard(makeBoard());
      useBoardStore.getState().reorderLanes(['lane-2', 'invalid-lane']);

      const board = useBoardStore.getState().board!;
      expect(board.lanes.map((l) => l.id)).toEqual(['lane-2']);
      expect(board.lanes[0].position).toBe(0);
    });
  });
});

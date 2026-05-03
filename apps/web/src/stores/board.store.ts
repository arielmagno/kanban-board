import { create } from 'zustand';
import type { Board, Lane, Card } from '@/features/board/board.types';

interface BoardState {
  board: Board | null;
  setBoard: (board: Board) => void;
  snapshot: () => Board | null;
  rollback: (snap: Board | null) => void;
  moveCard: (cardId: string, fromLaneId: string, toLaneId: string, toPosition: number) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  board: null,

  setBoard: (board) => set({ board }),

  snapshot: () => {
    const board = get().board;
    if (!board) return null;
    return JSON.parse(JSON.stringify(board)) as Board;
  },

  rollback: (snap) => set({ board: snap }),

  moveCard: (cardId, fromLaneId, toLaneId, toPosition) => {
    const board = get().board;
    if (!board) return;

    const lanes = board.lanes.map((lane): Lane => {
      if (lane.id !== fromLaneId && lane.id !== toLaneId) return lane;

      let cards = lane.cards.filter((c) => c.id !== cardId);

      if (lane.id === toLaneId) {
        const movedCard = board.lanes
          .flatMap((l) => l.cards)
          .find((c) => c.id === cardId);
        if (!movedCard) return { ...lane, cards };

        const updated: Card = { ...movedCard, laneId: toLaneId, position: toPosition };
        cards = [
          ...cards.slice(0, toPosition),
          updated,
          ...cards.slice(toPosition),
        ].map((c, i) => ({ ...c, position: i }));
      } else {
        cards = cards.map((c, i) => ({ ...c, position: i }));
      }

      return { ...lane, cards };
    });

    set({ board: { ...board, lanes } });
  },
}));

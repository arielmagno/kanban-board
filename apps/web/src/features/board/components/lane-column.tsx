'use client';

import { useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { MoreHorizontal, Plus, Trash2, Pencil } from 'lucide-react';
import type { Lane, Card } from '../board.types';
import { useDeleteLane, useUpdateLane } from '../hooks/use-board';
import { useDeleteCard } from '../hooks/use-card';
import { CardItem } from './card-item';

const LANE_COLORS = [
  { bg: 'bg-[#fce8ed]', dot: 'bg-[#f06292]', hover: 'ring-[#f06292]' },
  { bg: 'bg-[#fff3e0]', dot: 'bg-[#fb8c00]', hover: 'ring-[#fb8c00]' },
  { bg: 'bg-[#e8f4fd]', dot: 'bg-[#42a5f5]', hover: 'ring-[#42a5f5]' },
  { bg: 'bg-[#ede7f6]', dot: 'bg-[#ab47bc]', hover: 'ring-[#ab47bc]' },
];

interface LaneColumnProps {
  lane: Lane;
  index: number;
  boardId: string;
  boardColor?: string | null;
  isOver?: boolean;
  onAddCard: (laneId: string) => void;
  onEditCard: (card: Card) => void;
}

export function LaneColumn({ lane, index, boardId, boardColor, isOver, onAddCard, onEditCard }: LaneColumnProps) {
  const color = LANE_COLORS[index % LANE_COLORS.length];
  // When the board has a custom background, use white translucent lanes for contrast
  const laneBg = boardColor ? 'bg-white/75 backdrop-blur-sm' : color.bg;
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(lane.title);

  const deleteLane = useDeleteLane(boardId);
  const updateLane = useUpdateLane(boardId);
  const deleteCard = useDeleteCard(boardId);

  const { setNodeRef } = useDroppable({ id: lane.id, data: { type: 'lane', laneId: lane.id } });

  function handleRename() {
    if (newTitle.trim() && newTitle !== lane.title) {
      updateLane.mutate({ laneId: lane.id, title: newTitle.trim() });
    }
    setRenaming(false);
    setMenuOpen(false);
  }

  return (
    <div
      className={`flex flex-col rounded-2xl ${laneBg} p-3 min-w-[300px] w-[300px]
        max-h-[calc(100vh-150px)] transition-all duration-150
        ${isOver ? `ring-2 ${color.hover}` : ''}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className={`w-2 h-2 rounded-full ${color.dot} flex-shrink-0`} />
        {renaming ? (
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            className="flex-1 text-sm font-semibold bg-transparent border-b border-gray-400 focus:outline-none"
          />
        ) : (
          <span className="flex-1 text-sm font-semibold text-gray-800">{lane.title}</span>
        )}
        <span className="text-xs text-gray-400 font-medium">{lane.cards.length}</span>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="p-1 rounded-lg hover:bg-black/5 transition text-gray-400"
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 w-44">
              <button
                onClick={() => { setRenaming(true); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Pencil size={14} /> Rename
              </button>
              {!lane.isDefault ? (
                <button
                  onClick={() => { deleteLane.mutate(lane.id); setMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={14} /> Delete lane
                </button>
              ) : (
                <p className="px-3 py-2 text-xs text-gray-400 italic">Default — cannot delete</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cards */}
      <div ref={setNodeRef} className="flex-1 overflow-y-auto space-y-2 min-h-[40px] px-0.5">
        <SortableContext
          items={lane.cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {lane.cards.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-6 select-none">Drop cards here</p>
          )}
          {lane.cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onEdit={onEditCard}
              onDelete={(id) => deleteCard.mutate(id)}
            />
          ))}
        </SortableContext>
      </div>

      {/* Footer */}
      <button
        onClick={() => onAddCard(lane.id)}
        className="flex items-center gap-1.5 mt-2 px-2 py-2 rounded-xl text-sm text-gray-500 hover:bg-black/5 transition w-full"
      >
        <Plus size={15} /> Add task
      </button>
    </div>
  );
}

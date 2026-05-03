'use client';

import { useState, useRef } from 'react';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, Plus, Trash2, Pencil, GripHorizontal, Lock } from 'lucide-react';
import type { Lane, Card } from '../board.types';
import { useDeleteLane, useUpdateLane } from '../hooks/use-board';
import { useDeleteCard } from '../hooks/use-card';
import { useOnClickOutside } from '@/lib/use-on-click-outside';
import { CardItem } from './card-item';

const LANE_COLORS = [
  { bg: 'bg-[var(--color-lane-todo)]', dot: 'bg-[var(--color-dot-todo)]', hover: 'ring-[var(--color-dot-todo)]' },
  { bg: 'bg-[var(--color-lane-inprogress)]', dot: 'bg-[var(--color-dot-inprogress)]', hover: 'ring-[var(--color-dot-inprogress)]' },
  { bg: 'bg-[var(--color-lane-inreview)]', dot: 'bg-[var(--color-dot-inreview)]', hover: 'ring-[var(--color-dot-inreview)]' },
  { bg: 'bg-[var(--color-lane-done)]', dot: 'bg-[var(--color-dot-done)]', hover: 'ring-[var(--color-dot-done)]' },
];

interface LaneColumnProps {
  lane: Lane;
  index: number;
  boardId: string;
  boardColor?: string | null;
  isOver?: boolean;
  isOwner: boolean;
  onAddCard: (laneId: string) => void;
  onEditCard: (card: Card) => void;
  onViewCard: (card: Card) => void;
}

export function LaneColumn({ lane, index, boardId, boardColor, isOver, isOwner, onAddCard, onEditCard, onViewCard }: LaneColumnProps) {
  // Generate a consistent color index based on lane ID to maintain color across reorders
  const colorIndex = lane.color 
    ? parseInt(lane.color) 
    : Math.abs(lane.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % LANE_COLORS.length;
  const color = LANE_COLORS[colorIndex];
  // When the board has a custom background, use white translucent lanes for contrast
  const laneBg = boardColor ? 'bg-white/75 dark:bg-card-bg/85 backdrop-blur-sm' : color.bg;
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(lane.title);

  const deleteLane = useDeleteLane(boardId);
  const updateLane = useUpdateLane(boardId);
  const deleteCard = useDeleteCard(boardId);
  const laneMenuRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(laneMenuRef, () => setMenuOpen(false), menuOpen);

  const {
    setNodeRef: setLaneRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lane.id,
    data: { type: 'lane', laneId: lane.id },
    disabled: !isOwner,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function handleRename() {
    if (newTitle.trim() && newTitle !== lane.title) {
      updateLane.mutate({ laneId: lane.id, title: newTitle.trim() });
    }
    setRenaming(false);
    setMenuOpen(false);
  }

  return (
    <div
      ref={setLaneRef}
      style={style}
      className={`flex flex-col rounded-2xl ${laneBg} p-[var(--bf-lane-pad)] min-w-[var(--bf-lane-width)] w-[var(--bf-lane-width)]
        max-h-[calc(100vh-150px)] transition-all duration-[var(--bf-motion-duration)] group/lane
        ${isOver ? `ring-2 ${color.hover}` : ''}
        ${isDragging ? 'opacity-50 scale-[0.98] rotate-1 shadow-xl' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 px-1 relative">
        {!isOwner && (
          <div className="absolute -top-2 -right-2 bg-card-bg rounded-full p-1 shadow-sm border border-bf-border z-10">
            <Lock size={10} className="text-bf-muted" />
          </div>
        )}
        {isOwner && (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-bf-muted hover:text-bf-text transition duration-[var(--bf-motion-duration)] opacity-0 group-hover/lane:opacity-100"
          >
            <GripHorizontal size={14} />
          </div>
        )}
        <span className={`w-2 h-2 rounded-full ${color.dot} flex-shrink-0`} />
        {renaming ? (
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            className="flex-1 text-sm font-semibold bg-transparent border-b border-bf-border text-bf-text focus:outline-none"
          />
        ) : (
          <span className="flex-1 text-sm font-semibold text-heading">{lane.title}</span>
        )}
        <span className="text-xs text-muted font-medium">{lane.cards.length}</span>
        {isOwner && (
          <div className="relative" ref={laneMenuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition duration-[var(--bf-motion-duration)] text-bf-muted"
            >
              <MoreHorizontal size={16} />
            </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 bg-bf-surface rounded-xl shadow-lg border border-bf-border py-1 z-10 w-44">
              <button
                onClick={() => { setRenaming(true); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-bf-text hover:bg-bf-surface-muted"
              >
                <Pencil size={14} /> Rename
              </button>
              {!lane.isDefault && (
                <button
                  onClick={() => { deleteLane.mutate(lane.id); setMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 size={14} /> Delete lane
                </button>
              )}
            </div>
          )}
          </div>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto min-h-[40px] px-0.5 space-y-[var(--bf-card-gap)]">
        <SortableContext
          items={lane.cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {lane.cards.length === 0 && (
            <p className="text-xs text-muted text-center py-6 select-none">Drop cards here</p>
          )}
          {lane.cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onEdit={isOwner ? onEditCard : () => {}}
              onDelete={isOwner ? (id) => deleteCard.mutate(id) : () => {}}
              onClick={onViewCard}
              isReadOnly={!isOwner}
            />
          ))}
        </SortableContext>
      </div>

      {/* Footer */}
      {isOwner && (
        <button
          onClick={() => onAddCard(lane.id)}
          className="flex items-center gap-1.5 mt-2 px-2 py-2 rounded-xl text-sm text-bf-muted hover:bg-black/5 dark:hover:bg-white/10 transition w-full duration-[var(--bf-motion-duration)]"
        >
          <Plus size={15} /> Add task
        </button>
      )}
    </div>
  );
}

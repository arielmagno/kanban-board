'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useBoard, useCreateLane } from '../hooks/use-board';
import { useMoveCard } from '../hooks/use-card';
import { useBoardStore } from '@/stores/board.store';
import { LaneColumn } from './lane-column';
import { CardItem } from './card-item';
import { CardModal } from './card-modal';
import { Plus, AlertCircle } from 'lucide-react';
import type { Card } from '../board.types';

export function BoardClient({ boardId }: { boardId: string }) {
  const { data: serverBoard, isLoading, isError, refetch } = useBoard(boardId);
  const { board, setBoard, moveCard: moveCardOptimistic } = useBoardStore();
  const moveCard = useMoveCard(boardId);
  const createLane = useCreateLane(boardId);

  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [overLaneId, setOverLaneId] = useState<string | null>(null);
  const [modalLaneId, setModalLaneId] = useState<string | null>(null);
  const [editCard, setEditCard] = useState<Card | null>(null);
  const [addingLane, setAddingLane] = useState(false);
  const [newLaneTitle, setNewLaneTitle] = useState('');

  // Only sync from server when no move is in flight — prevents overwriting optimistic state
  useEffect(() => {
    if (serverBoard && !moveCard.isPending) setBoard(serverBoard);
  }, [serverBoard, setBoard, moveCard.isPending]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  function onDragStart({ active }: DragStartEvent) {
    const card = active.data.current?.card as Card | undefined;
    if (card) setActiveCard(card);
  }

  function onDragOver({ over }: DragOverEvent) {
    if (!over) { setOverLaneId(null); return; }
    const overData = over.data.current;
    setOverLaneId(overData?.type === 'lane' ? over.id as string : overData?.card?.laneId ?? null);
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveCard(null);
    setOverLaneId(null);
    if (!over || !board) return;

    const card = active.data.current?.card as Card;
    if (!card) return;

    const overData = over.data.current;
    const toLaneId: string = overData?.type === 'lane' ? (over.id as string) : overData?.card?.laneId;
    if (!toLaneId) return;

    const targetLane = board.lanes.find((l) => l.id === toLaneId);
    if (!targetLane) return;

    let toPosition: number;
    if (overData?.type === 'card') {
      toPosition = overData.card.position;
    } else {
      toPosition = targetLane.cards.length;
    }

    // snapshot is captured in useMoveCard.onMutate for rollback — no need to do it here
    moveCardOptimistic(card.id, card.laneId, toLaneId, toPosition);
    moveCard.mutate({ cardId: card.id, toLaneId, position: toPosition });
  }

  function handleAddLane(e: React.FormEvent) {
    e.preventDefault();
    const title = newLaneTitle.trim();
    if (!title) return;
    createLane.mutate({ title }, { onSuccess: () => { setNewLaneTitle(''); setAddingLane(false); } });
  }

  if (isLoading) return (
    <div className="flex-1 overflow-x-auto">
      <div className="flex gap-4 p-6 h-full items-start">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="min-w-[300px] w-[300px] rounded-2xl bg-black/5 animate-pulse h-64 flex-shrink-0" />
        ))}
      </div>
    </div>
  );
  if (isError) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3">
      <AlertCircle size={32} className="text-gray-300" />
      <p className="text-gray-500">Failed to load board.</p>
      <button onClick={() => refetch()} className="text-sm text-[#4a9e7f] hover:underline">Try again</button>
    </div>
  );

  const displayBoard = board ?? serverBoard;
  if (!displayBoard) return null;
  const boardColor = displayBoard.color;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        {/* Trello-style: lanes fill full height, horizontal scrollbar sits at viewport bottom */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-4 px-6 py-4 h-full items-start min-w-max">
            {displayBoard.lanes.map((lane, index) => (
              <LaneColumn
                key={lane.id}
                lane={lane}
                index={index}
                boardId={boardId}
                boardColor={boardColor}
                isOver={overLaneId === lane.id}
                onAddCard={(laneId) => { setModalLaneId(laneId); setEditCard(null); }}
                onEditCard={(card) => { setEditCard(card); setModalLaneId(card.laneId); }}
              />
            ))}

            {addingLane ? (
              <form onSubmit={handleAddLane} className="flex-shrink-0 min-w-[300px] w-[300px]">
                <div className="bg-white rounded-2xl border border-gray-200 p-3 shadow-sm">
                  <input
                    autoFocus
                    value={newLaneTitle}
                    onChange={(e) => setNewLaneTitle(e.target.value)}
                    placeholder="Lane name"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4a9e7f] mb-2"
                  />
                  <div className="flex gap-2">
                    <button type="submit" disabled={createLane.isPending}
                      className="flex-1 py-1.5 rounded-lg bg-[#f5c842] text-gray-900 text-sm font-semibold hover:bg-[#f0ba1a] transition disabled:opacity-60">
                      Add lane
                    </button>
                    <button type="button" onClick={() => setAddingLane(false)}
                      className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-white/50 transition">
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setAddingLane(true)}
                className="flex-shrink-0 flex items-center gap-2 min-w-[220px] h-12 px-4 rounded-2xl border-2 border-dashed border-black/15 text-black/40 text-sm hover:border-black/30 hover:text-black/60 transition self-start"
              >
                <Plus size={16} /> Add lane
              </button>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeCard && (
            <div className="rotate-2 opacity-90">
              <CardItem card={activeCard} onEdit={() => {}} onDelete={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {modalLaneId && (
        <CardModal
          boardId={boardId}
          laneId={modalLaneId}
          editCard={editCard}
          onClose={() => { setModalLaneId(null); setEditCard(null); }}
        />
      )}
    </div>
  );
}

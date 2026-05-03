'use client';

import { useState, useEffect, useRef } from 'react';
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
import { useBoard, useCreateLane, useReorderLanes } from '../hooks/use-board';
import { useMoveCard } from '../hooks/use-card';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useOnClickOutside } from '@/lib/use-on-click-outside';
import { useBoardStore } from '@/stores/board.store';
import { useAuthStore } from '@/stores/auth.store';
import { LaneColumn } from './lane-column';
import { CardItem } from './card-item';
import { CardModal } from './card-modal';
import { CardDetailModal } from './card-detail-modal';
import { Plus, AlertCircle } from 'lucide-react';
import type { Card, Lane } from '../board.types';

export function BoardClient({
  boardId,
  onCardModalOpenChange,
}: {
  boardId: string;
  onCardModalOpenChange?: (open: boolean) => void;
}) {
  const { data: serverBoard, isLoading, isError, refetch } = useBoard(boardId);
  const { board, setBoard, moveCard: moveCardOptimistic, reorderLanes: reorderLanesOptimistic } = useBoardStore();
  const moveCard = useMoveCard(boardId);
  const reorderLanes = useReorderLanes(boardId);
  const createLane = useCreateLane(boardId);

  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [overLaneId, setOverLaneId] = useState<string | null>(null);
  const [modalLaneId, setModalLaneId] = useState<string | null>(null);
  const [viewCard, setViewCard] = useState<Card | null>(null);
  const [editCard, setEditCard] = useState<Card | null>(null);
  const [addingLane, setAddingLane] = useState(false);
  const [newLaneTitle, setNewLaneTitle] = useState('');
  const addLaneFormRef = useRef<HTMLFormElement>(null);
  const isOwnerRef = useRef(false);
  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => {
    onCardModalOpenChange?.(modalLaneId !== null || viewCard !== null);
  }, [modalLaneId, viewCard, onCardModalOpenChange]);

  useEffect(() => {
    if (modalLaneId !== null) {
      setAddingLane(false);
      setNewLaneTitle('');
    }
  }, [modalLaneId]);

  useOnClickOutside(
    addLaneFormRef,
    () => {
      if (!addingLane) return;
      setAddingLane(false);
      setNewLaneTitle('');
    },
    addingLane,
  );
  useEffect(() => {
    if (serverBoard && !moveCard.isPending) setBoard(serverBoard);
  }, [serverBoard, setBoard, moveCard.isPending]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const [activeLane, setActiveLane] = useState<Lane | null>(null);

  function onDragStart({ active }: DragStartEvent) {
    if (!isOwnerRef.current) return;
    const data = active.data.current;
    if (data?.type === 'card') {
      setActiveCard(data.card as Card);
    } else if (data?.type === 'lane') {
      const lane = board?.lanes.find((l) => l.id === data.laneId);
      if (lane) setActiveLane(lane);
    }
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!isOwnerRef.current) return;
    if (!over) { setOverLaneId(null); return; }
    const activeData = active.data.current;
    const overData = over.data.current;
    if (activeData?.type === 'lane') return; // lanes don't need over state highlighting
    setOverLaneId(overData?.type === 'lane' ? over.id as string : overData?.card?.laneId ?? null);
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveCard(null);
    setActiveLane(null);
    setOverLaneId(null);
    if (!isOwnerRef.current || !over || !board) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type === 'lane' && overData?.type === 'lane') {
      const activeId = active.id as string;
      const overId = over.id as string;
      if (activeId === overId) return;

      const oldIndex = board.lanes.findIndex((l) => l.id === activeId);
      const newIndex = board.lanes.findIndex((l) => l.id === overId);
      
      const newLanes = [...board.lanes];
      const [moved] = newLanes.splice(oldIndex, 1);
      newLanes.splice(newIndex, 0, moved);
      
      const laneIds = newLanes.map((l) => l.id);
      reorderLanesOptimistic(laneIds);
      reorderLanes.mutate({ orderedIds: laneIds });
      return;
    }

    const card = activeData?.card as Card;
    if (!card) return;

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
      <div className="flex h-full items-start gap-[var(--bf-board-gap)] px-[var(--bf-board-px)] py-[var(--bf-board-py)]">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="min-w-[var(--bf-lane-width)] w-[var(--bf-lane-width)] rounded-2xl bg-black/5 animate-pulse h-64 flex-shrink-0 duration-[var(--bf-motion-duration)]"
          />
        ))}
      </div>
    </div>
  );
  if (isError) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3">
      <AlertCircle size={32} className="text-muted" />
      <p className="text-muted">Failed to load board.</p>
      <button onClick={() => refetch()} className="text-sm text-[#4a9e7f] hover:underline">Try again</button>
    </div>
  );

  const displayBoard = board ?? serverBoard;
  if (!displayBoard) return null;
  const boardColor = displayBoard.color;
  const isOwner = currentUser?.id === displayBoard.owner.id;
  isOwnerRef.current = isOwner;

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
          <div className="flex gap-[var(--bf-board-gap)] px-[var(--bf-board-px)] py-[var(--bf-board-py)] h-full items-start min-w-max">
            <SortableContext
              items={displayBoard.lanes.map((l) => l.id)}
              strategy={horizontalListSortingStrategy}
            >
              {displayBoard.lanes.map((lane, index) => (
                <LaneColumn
                  key={lane.id}
                  lane={lane}
                  index={index}
                  boardId={boardId}
                  boardColor={boardColor}
                  isOver={overLaneId === lane.id}
                  isOwner={isOwner}
                  onAddCard={(laneId) => { setModalLaneId(laneId); setEditCard(null); }}
                  onEditCard={(card) => { setEditCard(card); setModalLaneId(card.laneId); }}
                  onViewCard={(card) => setViewCard(card)}
                />
              ))}
            </SortableContext>

            {isOwner && addingLane ? (
              <form ref={addLaneFormRef} onSubmit={handleAddLane} className="flex-shrink-0 min-w-[var(--bf-lane-width)] w-[var(--bf-lane-width)]">
                <div className="bg-bf-surface rounded-2xl border border-bf-border p-3 shadow-sm">
                  <input
                    autoFocus
                    value={newLaneTitle}
                    onChange={(e) => setNewLaneTitle(e.target.value)}
                    placeholder="Lane name"
                    className="w-full px-3 py-2 text-sm border border-bf-border rounded-xl bg-bf-surface text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[#4a9e7f] mb-2"
                  />
                  <div className="flex gap-2">
                    <button type="submit" disabled={createLane.isPending}
                      className="flex-1 py-1.5 rounded-lg bg-[#f5c842] text-gray-900 text-sm font-semibold hover:bg-[#f0ba1a] transition disabled:opacity-60">
                      Add lane
                    </button>
                    <button type="button" onClick={() => setAddingLane(false)}
                      className="px-3 py-1.5 rounded-lg text-sm text-bf-muted hover:bg-bf-surface-muted transition duration-[var(--bf-motion-duration)]">
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            ) : isOwner ? (
              <button
                onClick={() => setAddingLane(true)}
                className="flex-shrink-0 flex items-center gap-2 min-w-[220px] h-12 px-4 rounded-2xl border-2 border-dashed border-bf-border text-bf-muted text-sm hover:border-[#4a9e7f]/50 hover:text-heading transition duration-[var(--bf-motion-duration)] self-start"
              >
                <Plus size={16} /> Add lane
              </button>
            ) : null}
          </div>
        </div>

        <DragOverlay>
          {activeCard && (
            <div className="rotate-2 opacity-90">
              <CardItem card={activeCard} onEdit={() => {}} onDelete={() => {}} />
            </div>
          )}
          {activeLane && (
            <div className="rotate-2 opacity-90">
              <LaneColumn
                lane={activeLane}
                index={board?.lanes.findIndex((l) => l.id === activeLane.id) ?? 0}
                boardId={boardId}
                boardColor={boardColor}
                isOwner={false}
                onAddCard={() => {}}
                onEditCard={() => {}}
                onViewCard={() => {}}
              />
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

      {viewCard && displayBoard && (
        <CardDetailModal
          card={viewCard}
          author={displayBoard.owner}
          onClose={() => setViewCard(null)}
        />
      )}
    </div>
  );
}

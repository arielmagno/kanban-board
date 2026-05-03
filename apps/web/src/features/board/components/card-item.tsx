'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { Card } from '../board.types';

const MDPreview = dynamic(() => import('@uiw/react-md-editor').then((m) => m.default.Markdown), {
  ssr: false,
});

interface CardItemProps {
  card: Card;
  onEdit: (card: Card) => void;
  onDelete: (cardId: string) => void;
  onClick?: (card: Card) => void;
  isReadOnly?: boolean;
}

export function CardItem({ card, onEdit, onDelete, onClick, isReadOnly = false }: CardItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'card', card },
    disabled: isReadOnly,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(!isReadOnly ? attributes : {})}
      {...(!isReadOnly ? listeners : {})}
      onClick={() => onClick?.(card)}
      className={`group bg-white rounded-xl border border-gray-100 p-3.5 shadow-sm
        hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 touch-none
        ${!isReadOnly ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
        ${isDragging ? 'opacity-50 scale-95 rotate-1 shadow-lg' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1">{card.title}</p>
        {!isReadOnly && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onEdit(card); }}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
            >
              <Pencil size={13} />
            </button>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
              className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>
      {card.description && (
        <div
          data-color-mode="light"
          className="mt-1.5 text-xs text-gray-400 line-clamp-3 [&_p]:leading-snug [&_*]:text-xs [&_*]:text-gray-400"
        >
          <MDPreview source={card.description} />
        </div>
      )}
    </div>
  );
}

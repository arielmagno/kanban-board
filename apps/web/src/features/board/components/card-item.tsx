'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { Card } from '../board.types';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';

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
  const colorMode = useResolvedColorScheme();
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
      className={`group bg-card-bg rounded-xl border border-bf-border py-[var(--bf-card-py)] px-[var(--bf-card-px)] shadow-sm
        hover:-translate-y-0.5 hover:shadow-md transition-all duration-[var(--bf-motion-duration)] touch-none
        ${!isReadOnly ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
        ${isDragging ? 'opacity-50 scale-95 rotate-1 shadow-lg' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className="font-semibold text-heading line-clamp-2 flex-1"
          style={{ fontSize: 'var(--bf-card-title-size)' }}
        >
          {card.title}
        </p>
        {!isReadOnly && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onEdit(card); }}
              className="p-1 rounded-lg hover:bg-bf-surface-muted text-bf-muted hover:text-bf-text transition duration-[var(--bf-motion-duration)]"
            >
              <Pencil size={13} />
            </button>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
              className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-bf-muted hover:text-red-500 transition duration-[var(--bf-motion-duration)]"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>
      {card.description && (
        <div
          data-color-mode={colorMode}
          className="mt-1.5 text-muted line-clamp-3 [&_p]:leading-snug [&_*]:text-[length:var(--bf-card-desc-size)] [&_*]:text-muted"
        >
          <MDPreview source={card.description} />
        </div>
      )}
    </div>
  );
}

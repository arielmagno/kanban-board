'use client';

import { X, Calendar, AlignLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { Card, BoardOwner } from '../board.types';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';

const MDPreview = dynamic(() => import('@uiw/react-md-editor').then((m) => m.default.Markdown), {
  ssr: false,
});

interface CardDetailModalProps {
  card: Card;
  author: BoardOwner;
  onClose: () => void;
}

export function CardDetailModal({ card, author, onClose }: CardDetailModalProps) {
  const colorMode = useResolvedColorScheme();
  const formattedDate = new Date(card.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const authorName = author.fullName?.trim() || author.email;

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-bf-surface rounded-2xl shadow-xl w-full max-w-2xl p-6 animate-slide-up flex flex-col max-h-[90vh] border border-bf-border"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-heading leading-tight">
              {card.title}
            </h2>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-bf-muted font-medium">
              <Calendar size={13} className="text-muted" />
              <span>Added on {formattedDate} by {authorName}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-bf-surface-muted transition duration-[var(--bf-motion-duration)] text-bf-muted flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {card.description ? (
            <div>
              <div className="flex items-center gap-2 mb-3 text-heading font-semibold text-sm">
                <AlignLeft size={16} className="text-muted" />
                Description
              </div>
              <div
                data-color-mode={colorMode}
                className="text-sm text-heading leading-relaxed [&_p]:mb-3 [&_ul]:mb-3 [&_ol]:mb-3 [&_li]:mb-1 [&_img]:rounded-xl [&_img]:border [&_img]:border-bf-border"
              >
                <MDPreview source={card.description} />
              </div>
            </div>
          ) : (
            <div className="py-8 text-center bg-bf-surface-muted rounded-xl border border-bf-border border-dashed">
              <p className="text-sm text-muted">No description provided.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

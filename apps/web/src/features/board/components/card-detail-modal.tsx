'use client';

import { X, Calendar, AlignLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { Card, BoardOwner } from '../board.types';

const MDPreview = dynamic(() => import('@uiw/react-md-editor').then((m) => m.default.Markdown), {
  ssr: false,
});

interface CardDetailModalProps {
  card: Card;
  author: BoardOwner;
  onClose: () => void;
}

export function CardDetailModal({ card, author, onClose }: CardDetailModalProps) {
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
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 animate-slide-up flex flex-col max-h-[90vh]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 leading-tight">
              {card.title}
            </h2>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500 font-medium">
              <Calendar size={13} className="text-gray-400" />
              <span>Added on {formattedDate} by {authorName}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400 flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {card.description ? (
            <div>
              <div className="flex items-center gap-2 mb-3 text-gray-700 font-semibold text-sm">
                <AlignLeft size={16} className="text-gray-400" />
                Description
              </div>
              <div
                data-color-mode="light"
                className="text-sm text-gray-700 leading-relaxed [&_p]:mb-3 [&_ul]:mb-3 [&_ol]:mb-3 [&_li]:mb-1 [&_img]:rounded-xl [&_img]:border [&_img]:border-gray-200"
              >
                <MDPreview source={card.description} />
              </div>
            </div>
          ) : (
            <div className="py-8 text-center bg-gray-50 rounded-xl border border-gray-100 border-dashed">
              <p className="text-sm text-gray-400">No description provided.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

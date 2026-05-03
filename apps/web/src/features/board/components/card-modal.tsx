'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { X } from 'lucide-react';
import { useCreateCard, useUpdateCard } from '../hooks/use-card';
import { createCardSchema } from '@boardflow/shared';
import type { Card } from '../board.types';
import '@uiw/react-md-editor/markdown-editor.css';
import {
  bold,
  image,
  quote,
  strikethrough,
  unorderedListCommand,
} from '@uiw/react-md-editor';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

/** Bold, strikethrough, blockquote (indent), bullets, image — matches a minimal Todoist-style bar */
const CARD_DESCRIPTION_COMMANDS = [
  bold,
  strikethrough,
  quote,
  unorderedListCommand,
  image,
];

interface CardModalProps {
  boardId: string;
  laneId: string;
  editCard?: Card | null;
  onClose: () => void;
}

export function CardModal({ boardId, laneId, editCard, onClose }: CardModalProps) {
  const [title, setTitle] = useState(editCard?.title ?? '');
  const [description, setDescription] = useState(editCard?.description ?? '');
  const [error, setError] = useState('');

  const createCard = useCreateCard(boardId, laneId);
  const updateCard = useUpdateCard(boardId);

  useEffect(() => {
    setTitle(editCard?.title ?? '');
    setDescription(editCard?.description ?? '');
  }, [editCard]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = createCardSchema.safeParse({ title, laneId });
    if (!result.success) {
      setError(result.error.flatten().fieldErrors.title?.[0] ?? 'Invalid title');
      return;
    }

    if (editCard) {
      updateCard.mutate(
        { cardId: editCard.id, dto: { title, description: description || undefined } },
        { onSuccess: onClose },
      );
    } else {
      createCard.mutate({ title, description: description || undefined }, { onSuccess: onClose });
    }
  }

  const isPending = createCard.isPending || updateCard.isPending;

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-bf-surface rounded-2xl shadow-xl w-full max-w-2xl p-6 animate-slide-up border border-bf-border" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-heading">
            {editCard ? 'Edit card' : 'Add card'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-bf-surface-muted transition duration-[var(--bf-motion-duration)] text-bf-muted">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(''); }}
              placeholder="Card title"
              className="w-full px-4 py-2.5 rounded-xl border border-bf-border bg-bf-surface text-heading text-sm font-medium placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[#4a9e7f] transition duration-[var(--bf-motion-duration)]"
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>

          <div data-color-mode="light" className="rounded-xl border border-bf-border overflow-hidden [&_.w-md-editor]:shadow-none [&_.w-md-editor]:!rounded-xl [&_.w-md-editor-toolbar]:!py-1.5 [&_.w-md-editor-toolbar]:!px-1 [&_.w-md-editor-toolbar_li_button]:!p-1.5">
            <MDEditor
              value={description}
              onChange={(val) => setDescription(val ?? '')}
              commands={CARD_DESCRIPTION_COMMANDS}
              extraCommands={[]}
              preview="edit"
              height={168}
              visibleDragbar={false}
              highlightEnable={false}
              tabSize={2}
              textareaProps={{ placeholder: 'Add notes (optional)' }}
            />
          </div>

          {(createCard.isError || updateCard.isError) && (
            <p className="text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2">
              {(createCard.error || updateCard.error) instanceof Error &&
              (createCard.error || updateCard.error)?.message
                ? (createCard.error ?? updateCard.error)?.message
                : 'Failed to save — please try again.'}
            </p>
          )}

          <div className="flex gap-2 pt-1 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-bf-text hover:bg-bf-surface-muted transition duration-[var(--bf-motion-duration)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-xl bg-[#f5c842] text-gray-900 text-sm font-semibold hover:bg-[#f0ba1a] transition disabled:opacity-60"
            >
              {isPending ? 'Saving…' : editCard ? 'Save changes' : 'Add card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

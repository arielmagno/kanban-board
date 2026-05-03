'use client';

import { X } from 'lucide-react';
import { useOnClickOutside } from '@/lib/use-on-click-outside';
import { useRef } from 'react';
import {
  useUiPreferencesStore,
  type AnimationSpeed,
  type CardSize,
  type BoardDensity,
} from '@/stores/ui-preferences.store';

const speeds: { id: AnimationSpeed; label: string }[] = [
  { id: 'slow', label: 'Slower' },
  { id: 'normal', label: 'Normal' },
  { id: 'fast', label: 'Snappy' },
];

const cardSizes: { id: CardSize; label: string; hint: string }[] = [
  { id: 'compact', label: 'Compact', hint: 'Tighter cards' },
  { id: 'comfortable', label: 'Comfortable', hint: 'Default' },
  { id: 'spacious', label: 'Spacious', hint: 'More padding' },
];

const densities: { id: BoardDensity; label: string; hint: string }[] = [
  { id: 'compact', label: 'Compact', hint: 'Narrow lanes, tight gaps' },
  { id: 'comfortable', label: 'Comfortable', hint: 'Default' },
  { id: 'spacious', label: 'Spacious', hint: 'Wide lanes, airy layout' },
];

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex rounded-xl border border-sidebar-border p-0.5 bg-white/70 backdrop-blur-sm">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition-[color,background-color,box-shadow] sm:text-sm duration-[var(--bf-motion-duration)] ${
            value === o.id
              ? 'bg-bf-surface text-bf-text shadow-sm border border-bf-border/60'
              : 'text-sidebar-fg-muted hover:text-sidebar-fg'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const animationSpeed = useUiPreferencesStore((s) => s.animationSpeed);
  const cardSize = useUiPreferencesStore((s) => s.cardSize);
  const boardDensity = useUiPreferencesStore((s) => s.boardDensity);
  const setAnimationSpeed = useUiPreferencesStore((s) => s.setAnimationSpeed);
  const setCardSize = useUiPreferencesStore((s) => s.setCardSize);
  const setBoardDensity = useUiPreferencesStore((s) => s.setBoardDensity);

  useOnClickOutside(panelRef, onClose, open);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-50 md:bg-transparent md:pointer-events-none"
        aria-hidden
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      />
      <div
        ref={panelRef}
        className="fixed z-50 inset-x-0 bottom-0 max-h-[min(90vh,640px)] md:inset-auto md:top-0 md:right-0 md:bottom-0 md:h-full md:max-h-none md:w-[min(100vw,380px)] md:border-l border-sidebar-border bg-sidebar-bg text-sidebar-fg shadow-2xl flex flex-col rounded-t-2xl md:rounded-none animate-slide-up md:animate-none transition-colors duration-[var(--bf-motion-duration)]"
        role="dialog"
        aria-labelledby="settings-heading"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-sidebar-border flex-shrink-0">
          <h2 id="settings-heading" className="text-lg font-bold text-sidebar-fg">
            Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-sidebar-fg-muted hover:bg-black/10 transition-colors duration-[var(--bf-motion-duration)]"
            aria-label="Close settings"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-sidebar-fg-muted mb-2">Animation</h3>
            <p className="text-sm text-sidebar-fg-muted mb-2">Interface transition speed</p>
            <Segmented options={speeds} value={animationSpeed} onChange={setAnimationSpeed} />
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-sidebar-fg-muted mb-2">Cards</h3>
            <div className="space-y-2">
              {cardSizes.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCardSize(c.id)}
                  className={`w-full text-left rounded-xl border px-3 py-2.5 transition-colors duration-[var(--bf-motion-duration)] ${
                    cardSize === c.id
                      ? 'border-brand bg-white shadow-sm'
                      : 'border-sidebar-border hover:bg-black/6'
                  }`}
                >
                  <span className="font-medium text-sidebar-fg text-sm">{c.label}</span>
                  <span className="block text-xs text-sidebar-fg-muted">{c.hint}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-sidebar-fg-muted mb-2">Board density</h3>
            <div className="space-y-2">
              {densities.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setBoardDensity(d.id)}
                  className={`w-full text-left rounded-xl border px-3 py-2.5 transition-colors duration-[var(--bf-motion-duration)] ${
                    boardDensity === d.id
                      ? 'border-brand bg-white shadow-sm'
                      : 'border-sidebar-border hover:bg-black/6'
                  }`}
                >
                  <span className="font-medium text-sidebar-fg text-sm">{d.label}</span>
                  <span className="block text-xs text-sidebar-fg-muted">{d.hint}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

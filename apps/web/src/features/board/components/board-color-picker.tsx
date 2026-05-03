'use client';

import { Check } from 'lucide-react';

export const BOARD_COLORS = [
  { value: '#bde3f8', label: 'Sky' },
  { value: '#a8dfcb', label: 'Mint' },
  { value: '#d4b8f0', label: 'Lavender' },
  { value: '#ffd9bf', label: 'Peach' },
  { value: '#ffb8c9', label: 'Rose' },
  { value: '#b8cce8', label: 'Slate' },
  { value: '#ffb3b3', label: 'Coral' },
  { value: '#f7f0a0', label: 'Lemon' },
  { value: '#b5d5b5', label: 'Sage' },
  { value: '#cfd8dc', label: 'Cool Gray' },
];

interface BoardColorPickerProps {
  value: string | null | undefined;
  onChange: (color: string | null) => void;
}

export function BoardColorPicker({ value, onChange }: BoardColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {/* None option */}
      <button
        type="button"
        onClick={() => onChange(null)}
        title="No color"
        className={`w-7 h-7 rounded-full border-2 bg-white flex items-center justify-center transition
          ${!value ? 'border-gray-500 scale-110' : 'border-gray-200 hover:border-gray-400'}`}
      >
        {!value && <Check size={11} className="text-gray-600" strokeWidth={3} />}
      </button>

      {BOARD_COLORS.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => onChange(c.value === value ? null : c.value)}
          title={c.label}
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition
            ${value === c.value ? 'border-gray-600 scale-110 shadow-sm' : 'border-transparent hover:scale-110'}`}
          style={{ backgroundColor: c.value }}
        >
          {value === c.value && <Check size={11} className="text-gray-700" strokeWidth={3} />}
        </button>
      ))}
    </div>
  );
}

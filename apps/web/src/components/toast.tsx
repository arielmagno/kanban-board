'use client';

import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useToastStore, type Toast, type ToastType } from '@/stores/toast.store';

const CONFIG: Record<
  ToastType,
  { Icon: React.ElementType; iconColor: string; borderColor: string; progressColor: string }
> = {
  error: {
    Icon: AlertCircle,
    iconColor: 'text-rose-500',
    borderColor: 'border-l-rose-500',
    progressColor: 'bg-rose-500',
  },
  success: {
    Icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    borderColor: 'border-l-emerald-500',
    progressColor: 'bg-emerald-500',
  },
  warning: {
    Icon: AlertTriangle,
    iconColor: 'text-amber-500',
    borderColor: 'border-l-amber-500',
    progressColor: 'bg-amber-500',
  },
  info: {
    Icon: Info,
    iconColor: 'text-blue-500',
    borderColor: 'border-l-blue-500',
    progressColor: 'bg-blue-500',
  },
};

function ToastItem({ toast }: { toast: Toast }) {
  const remove = useToastStore((s) => s.remove);
  const { Icon, iconColor, borderColor, progressColor } = CONFIG[toast.type];

  return (
    <div
      className={`
        relative w-80 bg-white rounded-xl shadow-lg border border-gray-100
        border-l-4 ${borderColor}
        overflow-hidden animate-toast-in
      `}
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <Icon size={18} className={`${iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 leading-snug">
            {toast.title}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            {toast.message}
          </p>
        </div>
        <button
          onClick={() => remove(toast.id)}
          className="flex-shrink-0 p-0.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>

      {/* Auto-dismiss progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gray-100">
        <div className={`h-full ${progressColor} animate-toast-progress opacity-60`} />
      </div>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[100] flex flex-col-reverse gap-2.5 items-end"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

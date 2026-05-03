import { create } from 'zustand';

export type ToastType = 'error' | 'success' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

interface ToastState {
  toasts: Toast[];
  add: (toast: Omit<Toast, 'id'>) => void;
  remove: (id: string) => void;
}

const DURATION_MS = 5000;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  add: (toast) => {
    const id = crypto.randomUUID();
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, DURATION_MS);
  },

  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

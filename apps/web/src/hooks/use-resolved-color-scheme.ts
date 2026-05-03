'use client';

import { useSyncExternalStore } from 'react';

function subscribeColorScheme(cb: () => void) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}

function getColorSchemeSnapshot(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Matches the OS light/dark preference (for markdown `data-color-mode`, etc.). */
export function useResolvedColorScheme(): 'light' | 'dark' {
  return useSyncExternalStore(subscribeColorScheme, getColorSchemeSnapshot, () => 'light');
}

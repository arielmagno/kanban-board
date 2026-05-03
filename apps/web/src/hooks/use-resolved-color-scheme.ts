'use client';

import { useSyncExternalStore } from 'react';
import { useUiPreferencesStore } from '@/stores/ui-preferences.store';

function subscribeDarkPreference(cb: () => void) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}

function getDarkPreferenceSnapshot(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** For UI that must match the active palette (e.g. markdown preview `data-color-mode`). */
export function useResolvedColorScheme(): 'light' | 'dark' {
  const theme = useUiPreferencesStore((s) => s.theme);
  const systemDark = useSyncExternalStore(subscribeDarkPreference, getDarkPreferenceSnapshot, () => false);

  if (theme === 'dark') return 'dark';
  if (theme === 'light') return 'light';
  return systemDark ? 'dark' : 'light';
}

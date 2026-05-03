'use client';

import { useEffect } from 'react';
import {
  useUiPreferencesStore,
  applyUiPreferenceVars,
  resolveThemeClass,
} from '@/stores/ui-preferences.store';

/** Applies theme class and layout CSS variables from the persisted UI store. */
export function UiPreferencesBridge() {
  const theme = useUiPreferencesStore((s) => s.theme);
  const animationSpeed = useUiPreferencesStore((s) => s.animationSpeed);
  const cardSize = useUiPreferencesStore((s) => s.cardSize);
  const boardDensity = useUiPreferencesStore((s) => s.boardDensity);

  useEffect(() => {
    const root = document.documentElement;

    function sync() {
      const state = useUiPreferencesStore.getState();
      const resolved = resolveThemeClass(state.theme);
      root.classList.toggle('dark', resolved === 'dark');
      applyUiPreferenceVars(root, state);
    }

    sync();

    if (theme !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [theme, animationSpeed, cardSize, boardDensity]);

  return null;
}

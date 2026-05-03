'use client';

import { useEffect } from 'react';
import { useUiPreferencesStore, applyUiPreferenceVars } from '@/stores/ui-preferences.store';

/** Applies OS color-scheme (prefers-color-scheme) and layout CSS variables. */
export function UiPreferencesBridge() {
  const animationSpeed = useUiPreferencesStore((s) => s.animationSpeed);
  const cardSize = useUiPreferencesStore((s) => s.cardSize);
  const boardDensity = useUiPreferencesStore((s) => s.boardDensity);

  useEffect(() => {
    const root = document.documentElement;

    function sync() {
      const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', dark);
      applyUiPreferenceVars(root, useUiPreferencesStore.getState());
    }

    sync();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [animationSpeed, cardSize, boardDensity]);

  return null;
}

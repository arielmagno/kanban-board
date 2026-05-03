'use client';

import { useEffect } from 'react';
import { useUiPreferencesStore, applyUiPreferenceVars } from '@/stores/ui-preferences.store';

/** Applies layout CSS variables (animation speed, card size, board density from settings). */
export function UiPreferencesBridge() {
  const animationSpeed = useUiPreferencesStore((s) => s.animationSpeed);
  const cardSize = useUiPreferencesStore((s) => s.cardSize);
  const boardDensity = useUiPreferencesStore((s) => s.boardDensity);

  useEffect(() => {
    applyUiPreferenceVars(document.documentElement, useUiPreferencesStore.getState());
  }, [animationSpeed, cardSize, boardDensity]);

  return null;
}

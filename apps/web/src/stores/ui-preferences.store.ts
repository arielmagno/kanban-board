import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type AnimationSpeed = 'slow' | 'normal' | 'fast';
export type CardSize = 'compact' | 'comfortable' | 'spacious';
export type BoardDensity = 'compact' | 'comfortable' | 'spacious';

const MOTION_MS: Record<AnimationSpeed, string> = {
  slow: '220ms',
  normal: '150ms',
  fast: '85ms',
};

const DENSITY_VARS: Record<
  BoardDensity,
  { laneWidth: string; boardGap: string; boardPx: string; boardPy: string; lanePad: string; cardGap: string }
> = {
  compact: {
    laneWidth: '260px',
    boardGap: '0.75rem',
    boardPx: '1rem',
    boardPy: '0.75rem',
    lanePad: '0.625rem',
    cardGap: '0.375rem',
  },
  comfortable: {
    laneWidth: '300px',
    boardGap: '1rem',
    boardPx: '1.5rem',
    boardPy: '1rem',
    lanePad: '0.75rem',
    cardGap: '0.5rem',
  },
  spacious: {
    laneWidth: '340px',
    boardGap: '1.5rem',
    boardPx: '2rem',
    boardPy: '1.5rem',
    lanePad: '1rem',
    cardGap: '0.75rem',
  },
};

const CARD_VARS: Record<CardSize, { py: string; px: string; title: string; desc: string }> = {
  compact: {
    py: '0.5rem',
    px: '0.625rem',
    title: '0.8125rem',
    desc: '0.6875rem',
  },
  comfortable: {
    py: '0.875rem',
    px: '0.875rem',
    title: '0.875rem',
    desc: '0.75rem',
  },
  spacious: {
    py: '1.125rem',
    px: '1rem',
    title: '1rem',
    desc: '0.875rem',
  },
};

export interface UiPreferencesState {
  animationSpeed: AnimationSpeed;
  cardSize: CardSize;
  boardDensity: BoardDensity;
  setAnimationSpeed: (speed: AnimationSpeed) => void;
  setCardSize: (size: CardSize) => void;
  setBoardDensity: (density: BoardDensity) => void;
}

export function getMotionDuration(speed: AnimationSpeed): string {
  return MOTION_MS[speed];
}

export function applyUiPreferenceVars(
  root: HTMLElement,
  prefs: Pick<UiPreferencesState, 'animationSpeed' | 'cardSize' | 'boardDensity'>,
) {
  const d = DENSITY_VARS[prefs.boardDensity];
  const c = CARD_VARS[prefs.cardSize];
  root.style.setProperty('--bf-motion-duration', getMotionDuration(prefs.animationSpeed));
  root.style.setProperty('--bf-lane-width', d.laneWidth);
  root.style.setProperty('--bf-board-gap', d.boardGap);
  root.style.setProperty('--bf-board-px', d.boardPx);
  root.style.setProperty('--bf-board-py', d.boardPy);
  root.style.setProperty('--bf-lane-pad', d.lanePad);
  root.style.setProperty('--bf-card-gap', d.cardGap);
  root.style.setProperty('--bf-card-py', c.py);
  root.style.setProperty('--bf-card-px', c.px);
  root.style.setProperty('--bf-card-title-size', c.title);
  root.style.setProperty('--bf-card-desc-size', c.desc);
}

export const useUiPreferencesStore = create<UiPreferencesState>()(
  persist(
    (set) => ({
      animationSpeed: 'normal',
      cardSize: 'comfortable',
      boardDensity: 'comfortable',
      setAnimationSpeed: (animationSpeed) => set({ animationSpeed }),
      setCardSize: (cardSize) => set({ cardSize }),
      setBoardDensity: (boardDensity) => set({ boardDensity }),
    }),
    {
      name: 'boardflow-ui-prefs',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        animationSpeed: s.animationSpeed,
        cardSize: s.cardSize,
        boardDensity: s.boardDensity,
      }),
    },
  ),
);

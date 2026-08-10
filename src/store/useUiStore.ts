import { create } from 'zustand';

interface UiState {
  selectedItemId: string | null;
  focusMode: boolean;
  selectItem: (itemId: string) => void;
  toggleFocusMode: () => void;
}

/**
 * UI-only state (selection, view toggles). Progress/derived domain state lives
 * in useCourseStore (added in P3) and is never duplicated here.
 */
export const useUiStore = create<UiState>((set) => ({
  selectedItemId: null,
  focusMode: false,
  selectItem: (itemId) => set({ selectedItemId: itemId }),
  toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),
}));

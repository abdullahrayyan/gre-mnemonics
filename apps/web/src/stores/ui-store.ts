import { create } from 'zustand';

interface UiState {
  /** Mobile navigation / sidebar open state. */
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebar: (open: boolean) => void;
  /** Command palette open state. */
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
}

/** Client-side UI state (server state lives in React Query). */
export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebar: (open) => set({ sidebarOpen: open }),
  commandOpen: false,
  setCommandOpen: (open) => set({ commandOpen: open }),
}));

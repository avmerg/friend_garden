import { create } from 'zustand';

interface GardenStore {
  version: number;
  bump: () => void;
}

export const useGardenStore = create<GardenStore>((set) => ({
  version: 0,
  bump: () => set((state) => ({ version: state.version + 1 })),
}));

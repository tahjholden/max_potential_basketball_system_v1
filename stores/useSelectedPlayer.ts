import { create } from 'zustand'

interface SelectedPlayerStore {
  playerId: string | null
  setPlayerId: (id: string) => void
  clearPlayerId: () => void
}

export const useSelectedPlayer = create<SelectedPlayerStore>((set) => ({
  playerId: null,
  setPlayerId: (id) => set({ playerId: id }),
  clearPlayerId: () => set({ playerId: null }),
})) 
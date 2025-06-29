import { create } from 'zustand'
import { Player } from '../types/entities'

interface PlayerStore {
  players: Player[]
  selectedPlayer: Player | null
  loading: boolean
  setPlayers: (players: Player[]) => void
  setSelectedPlayer: (player: Player | null) => void
  setLoading: (loading: boolean) => void
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  players: [],
  selectedPlayer: null,
  loading: false,
  setPlayers: (players) => set({ players }),
  setSelectedPlayer: (player) => set({ selectedPlayer: player }),
  setLoading: (loading) => set({ loading }),
})) 
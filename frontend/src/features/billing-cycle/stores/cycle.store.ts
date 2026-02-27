import { create } from 'zustand'

interface CycleStore {
  selectedCycleId: string | null
  setSelectedCycleId: (id: string | null) => void
}

export const useCycleStore = create<CycleStore>((set) => ({
  selectedCycleId: null,
  setSelectedCycleId: (id) => set({ selectedCycleId: id }),
}))

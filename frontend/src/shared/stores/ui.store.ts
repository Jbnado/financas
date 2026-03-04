import { create } from 'zustand'

export type TabId = 'dashboard' | 'transacoes' | 'a-receber' | 'relatorios' | 'projecoes' | 'patrimonio' | 'config'

interface UIState {
  activeTab: TabId
  sidebarOpen: boolean
  setActiveTab: (tab: TabId) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'dashboard',
  sidebarOpen: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))

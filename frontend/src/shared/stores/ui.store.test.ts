import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from './ui.store'

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      activeTab: 'dashboard',
      sidebarOpen: false,
    })
  })

  it('should have default activeTab as dashboard', () => {
    expect(useUIStore.getState().activeTab).toBe('dashboard')
  })

  it('should have default sidebarOpen as false', () => {
    expect(useUIStore.getState().sidebarOpen).toBe(false)
  })

  it('should update activeTab', () => {
    useUIStore.getState().setActiveTab('transacoes')
    expect(useUIStore.getState().activeTab).toBe('transacoes')
  })

  it('should update sidebarOpen', () => {
    useUIStore.getState().setSidebarOpen(true)
    expect(useUIStore.getState().sidebarOpen).toBe(true)
  })

  it('should toggle sidebar', () => {
    expect(useUIStore.getState().sidebarOpen).toBe(false)
    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().sidebarOpen).toBe(true)
    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().sidebarOpen).toBe(false)
  })
})

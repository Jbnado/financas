import type { ComponentType } from 'react'
import { LayoutDashboard, Receipt, HandCoins, Landmark, Settings } from 'lucide-react'
import type { TabId } from '@/shared/stores/ui.store'

export interface NavItem {
  id: TabId
  label: string
  icon: ComponentType<{ className?: string }>
  path: string
}

export const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'transacoes', label: 'Transações', icon: Receipt, path: '/transacoes' },
  { id: 'a-receber', label: 'A Receber', icon: HandCoins, path: '/a-receber' },
  { id: 'patrimonio', label: 'Patrimônio', icon: Landmark, path: '/patrimonio' },
  { id: 'config', label: 'Config', icon: Settings, path: '/config' },
]

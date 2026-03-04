import type { ComponentType } from 'react'
import { LayoutDashboard, Receipt, HandCoins, BarChart3, TrendingUp, Settings } from 'lucide-react'
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
  { id: 'relatorios', label: 'Relatórios', icon: BarChart3, path: '/relatorios' },
  { id: 'projecoes', label: 'Projeções', icon: TrendingUp, path: '/projecoes' },
  { id: 'config', label: 'Config', icon: Settings, path: '/config' },
]

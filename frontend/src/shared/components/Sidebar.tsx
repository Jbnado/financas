import { Link, useLocation } from 'react-router'
import { cn } from '@/shared/utils/cn'
import { useUIStore } from '@/shared/stores/ui.store'
import { navItems } from '@/shared/constants/navigation'

export function Sidebar() {
  const location = useLocation()
  const setActiveTab = useUIStore((s) => s.setActiveTab)

  return (
    <nav className="hidden md:flex w-56 flex-col gap-1 border-r border-border bg-card p-4">
      <div className="mb-6 px-2">
        <h1 className="text-lg font-bold text-foreground">financas</h1>
      </div>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path
        return (
          <Link
            key={item.id}
            to={item.path}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-accent text-nav-active'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

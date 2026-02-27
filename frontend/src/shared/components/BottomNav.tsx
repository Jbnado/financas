import { Link, useLocation } from 'react-router'
import { cn } from '@/shared/utils/cn'
import { useUIStore } from '@/shared/stores/ui.store'
import { navItems } from '@/shared/constants/navigation'

export function BottomNav() {
  const location = useLocation()
  const setActiveTab = useUIStore((s) => s.setActiveTab)

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex min-h-14 items-center justify-around bg-nav-bg md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.path
        return (
          <Link
            key={item.id}
            to={item.path}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              'flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 px-3 py-1 transition-colors',
              isActive ? 'text-nav-active' : 'text-muted-foreground',
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] leading-tight">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

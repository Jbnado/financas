import { Suspense, useEffect } from 'react'
import { BrowserRouter, useLocation, useRoutes } from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/shared/lib/query-client'
import { routes } from '@/routes'
import { BottomNav } from '@/shared/components/BottomNav'
import { Sidebar } from '@/shared/components/Sidebar'
import { Fab } from '@/shared/components/Fab'
import { Toaster } from '@/shared/components/ui/toaster'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useUIStore } from '@/shared/stores/ui.store'
import { useAuthStore } from '@/shared/stores/auth.store'
import { navItems } from '@/shared/constants/navigation'

function PageSkeleton() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Skeleton className="h-8 w-48" />
    </div>
  )
}

function AppRoutes() {
  const element = useRoutes(routes)
  return <Suspense fallback={<PageSkeleton />}>{element}</Suspense>
}

function LocationSync() {
  const location = useLocation()
  const setActiveTab = useUIStore((s) => s.setActiveTab)

  useEffect(() => {
    const match = navItems.find((item) => item.path === location.pathname)
    if (match) setActiveTab(match.id)
  }, [location.pathname, setActiveTab])

  return null
}

function AppShell() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {isAuthenticated && <Sidebar />}
      <main className="flex flex-1 flex-col pb-14 md:pb-0">
        <AppRoutes />
      </main>
      {isAuthenticated && <BottomNav />}
      {isAuthenticated && <Fab />}
      <Toaster />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LocationSync />
        <AppShell />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

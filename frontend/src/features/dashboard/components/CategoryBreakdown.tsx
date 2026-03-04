import { Skeleton } from '@/shared/components/ui/skeleton'
import { formatCurrency } from '@/shared/utils/currency'
import type { CategoryBreakdownItem } from '@/features/billing-cycle/types'

interface CategoryBreakdownProps {
  items: CategoryBreakdownItem[]
  isLoading?: boolean
}

export function CategoryBreakdown({ items, isLoading }: CategoryBreakdownProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (items.length === 0) return null

  const maxTotal = parseFloat(items[0]?.total ?? '0') || 1
  const grandTotal = items.reduce((sum, item) => sum + parseFloat(item.total), 0)

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-muted-foreground">Por categoria</h2>
      {items.map((item) => {
        const value = parseFloat(item.total)
        const pct = grandTotal > 0 ? ((value / grandTotal) * 100).toFixed(0) : '0'
        const barWidth = (value / maxTotal) * 100

        return (
          <div key={item.categoryId} className="flex items-center gap-3">
            <div
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: item.categoryColor ?? '#6b7280' }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm truncate">{item.categoryName}</span>
                <span className="text-sm font-medium tabular-nums ml-2 shrink-0">
                  {formatCurrency(item.total)}
                </span>
              </div>
              <div className="h-1 w-full rounded-full bg-muted/30 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: item.categoryColor ?? '#6b7280',
                  }}
                />
              </div>
            </div>
            <span className="text-xs text-muted-foreground tabular-nums w-8 text-right shrink-0">
              {pct}%
            </span>
          </div>
        )
      })}
    </div>
  )
}

import { Skeleton } from '@/shared/components/ui/skeleton'
import { formatCurrency } from '@/shared/utils/currency'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import type { CycleComparison } from '../types'

interface CycleComparisonCardProps {
  data: CycleComparison | undefined
  isLoading?: boolean
}

function DiffIndicator({ value }: { value: string }) {
  const num = parseFloat(value)
  if (num > 0) return <ArrowUp className="h-3.5 w-3.5 text-red-400" />
  if (num < 0) return <ArrowDown className="h-3.5 w-3.5 text-green-400" />
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />
}

function DiffValue({ value, invertColor }: { value: string; invertColor?: boolean }) {
  const num = parseFloat(value)
  let color = '#94a3b8'
  if (num > 0) color = invertColor ? '#fca5a5' : '#6ee7a0'
  if (num < 0) color = invertColor ? '#6ee7a0' : '#fca5a5'
  return (
    <span className="text-sm font-medium tabular-nums" style={{ color }}>
      {num > 0 ? '+' : ''}{formatCurrency(value)}
    </span>
  )
}

export function CycleComparisonCard({ data, isLoading }: CycleComparisonCardProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    )
  }

  if (!data?.previous) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">Sem ciclo anterior para comparação</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground mb-3">
        {data.current.cycleName} vs {data.previous.cycleName}
      </h2>
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg p-3" style={{ backgroundColor: '#1e293b' }}>
          <span className="text-sm text-muted-foreground">Despesas</span>
          <div className="flex items-center gap-2">
            <span className="text-sm tabular-nums">{formatCurrency(data.current.totalExpenses)}</span>
            <DiffIndicator value={data.diff!.expensesDiff} />
            <DiffValue value={data.diff!.expensesDiff} invertColor />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg p-3" style={{ backgroundColor: '#1e293b' }}>
          <span className="text-sm text-muted-foreground">Resultado</span>
          <div className="flex items-center gap-2">
            <span className="text-sm tabular-nums">{formatCurrency(data.current.netResult)}</span>
            <DiffIndicator value={data.diff!.netResultDiff} />
            <DiffValue value={data.diff!.netResultDiff} />
          </div>
        </div>
        {data.current.categories.length > 0 && data.previous.categories.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Top categorias (atual)</p>
            {data.current.categories.slice(0, 3).map((cat) => {
              const prevCat = data.previous!.categories.find(
                (c) => c.categoryName === cat.categoryName,
              )
              const diff = prevCat
                ? (parseFloat(cat.total) - parseFloat(prevCat.total)).toFixed(2)
                : cat.total
              return (
                <div key={cat.categoryName} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: cat.categoryColor ?? '#6b7280' }}
                    />
                    <span>{cat.categoryName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="tabular-nums">{formatCurrency(cat.total)}</span>
                    {prevCat && (
                      <span
                        className="tabular-nums"
                        style={{
                          color:
                            parseFloat(diff) > 0
                              ? '#fca5a5'
                              : parseFloat(diff) < 0
                                ? '#6ee7a0'
                                : '#94a3b8',
                        }}
                      >
                        ({parseFloat(diff) > 0 ? '+' : ''}
                        {formatCurrency(diff)})
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

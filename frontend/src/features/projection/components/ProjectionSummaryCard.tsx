import { Skeleton } from '@/shared/components/ui/skeleton'
import { formatCurrency } from '@/shared/utils/currency'
import type { ProjectionEntry } from '../types'

interface ProjectionSummaryCardProps {
  projections: ProjectionEntry[]
  isLoading?: boolean
}

export function ProjectionSummaryCard({ projections, isLoading }: ProjectionSummaryCardProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      </div>
    )
  }

  if (projections.length === 0) return null

  const netResults = projections.map((p) => parseFloat(p.projectedNetResult))
  const average = netResults.reduce((sum, v) => sum + v, 0) / netResults.length
  const worst = projections.reduce((min, p) =>
    parseFloat(p.projectedNetResult) < parseFloat(min.projectedNetResult) ? p : min,
  )
  const best = projections.reduce((max, p) =>
    parseFloat(p.projectedNetResult) > parseFloat(max.projectedNetResult) ? p : max,
  )

  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground mb-3">Resumo da Projeção</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl p-3" style={{ backgroundColor: '#0f172a' }}>
          <p className="text-xs text-muted-foreground">Média Resultado</p>
          <p className="text-lg font-bold" style={{ color: average >= 0 ? '#6ee7a0' : '#fca5a5' }}>
            {average >= 0 ? '+' : ''}{formatCurrency(average.toFixed(2))}
          </p>
        </div>
        <div className="rounded-xl p-3" style={{ backgroundColor: '#0f172a' }}>
          <p className="text-xs text-muted-foreground">Pior Mês</p>
          <p className="text-sm font-medium text-muted-foreground">{worst.cycleName}</p>
          <p className="text-lg font-bold" style={{ color: parseFloat(worst.projectedNetResult) >= 0 ? '#6ee7a0' : '#fca5a5' }}>
            {formatCurrency(worst.projectedNetResult)}
          </p>
        </div>
        <div className="rounded-xl p-3" style={{ backgroundColor: '#0f172a' }}>
          <p className="text-xs text-muted-foreground">Melhor Mês</p>
          <p className="text-sm font-medium text-muted-foreground">{best.cycleName}</p>
          <p className="text-lg font-bold" style={{ color: parseFloat(best.projectedNetResult) >= 0 ? '#6ee7a0' : '#fca5a5' }}>
            {formatCurrency(best.projectedNetResult)}
          </p>
        </div>
      </div>
    </div>
  )
}

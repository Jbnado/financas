import { Skeleton } from '@/shared/components/ui/skeleton'
import { formatCurrency } from '@/shared/utils/currency'
import type { InstallmentCommitment } from '../types'

interface CommitmentTableProps {
  commitments: InstallmentCommitment[]
  isLoading?: boolean
}

export function CommitmentTable({ commitments, isLoading }: CommitmentTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground mb-3">Comprometimento Futuro</h2>
      {commitments.length === 0 ? (
        <div className="rounded-xl p-3 text-center" style={{ backgroundColor: '#0f172a' }}>
          <p className="text-sm text-muted-foreground">Nenhuma parcela futura</p>
        </div>
      ) : (
        <div className="space-y-2">
          {commitments.map((c) => (
            <div
              key={c.cycleName}
              className="flex items-center justify-between rounded-xl p-3"
              style={{ backgroundColor: '#0f172a' }}
            >
              <div>
                <p className="text-sm font-medium text-foreground">{c.cycleName}</p>
                <p className="text-xs text-muted-foreground">
                  {c.installmentCount} {c.installmentCount === 1 ? 'parcela' : 'parcelas'}
                </p>
              </div>
              <span className="text-sm font-medium text-foreground">
                {formatCurrency(c.totalCommitted)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

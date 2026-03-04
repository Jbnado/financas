import { Card, CardContent } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import type { PatrimonySummary } from '../types'

interface PatrimonyHeroCardProps {
  summary: PatrimonySummary | undefined
  isLoading: boolean
}

function formatCurrency(value: string | number): string {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function PatrimonyHeroCard({ summary, isLoading }: PatrimonyHeroCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-4 w-48" />
        </CardContent>
      </Card>
    )
  }

  if (!summary) return null

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Patrimônio Total</p>
            <p className="text-3xl font-bold tabular-nums" data-testid="total-assets">
              {formatCurrency(summary.totalAssets)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Patrimônio Líquido</p>
            <p className="text-3xl font-bold tabular-nums" data-testid="net-patrimony">
              {formatCurrency(summary.netPatrimony)}
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-6 text-sm text-muted-foreground">
          <span>Contas: {formatCurrency(summary.totalBankAccounts)}</span>
          <span>Investimentos: {formatCurrency(summary.totalInvestments)}</span>
        </div>
        {Number(summary.futureInstallments) > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Parcelas comprometidas: {formatCurrency(summary.futureInstallments)}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

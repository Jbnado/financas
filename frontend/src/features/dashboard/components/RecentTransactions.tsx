import { Link } from 'react-router'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { formatCurrency } from '@/shared/utils/currency'
import type { RecentTransaction } from '@/features/billing-cycle/types'

interface RecentTransactionsProps {
  transactions: RecentTransaction[]
  isLoading?: boolean
}

export function RecentTransactions({ transactions, isLoading }: RecentTransactionsProps) {

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-muted-foreground">Registre seu primeiro gasto</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">Transações recentes</h2>
        <Link to="/transacoes" className="text-xs text-primary hover:underline">
          Ver todas
        </Link>
      </div>
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center justify-between rounded-lg border border-border p-2.5"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: tx.category.color ?? '#6b7280' }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm truncate">{tx.description}</p>
              <p className="text-[11px] text-muted-foreground truncate">
                {tx.paymentMethod.name} · {tx.category.name}
              </p>
            </div>
          </div>
          <span className="text-sm font-medium tabular-nums shrink-0 ml-2">
            {formatCurrency(tx.userAmount)}
          </span>
        </div>
      ))}
    </div>
  )
}

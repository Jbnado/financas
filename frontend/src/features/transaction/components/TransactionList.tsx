import { Skeleton } from '@/shared/components/ui/skeleton'
import { TransactionItem } from './TransactionItem'
import type { Transaction } from '../types'

function formatDateGroup(isoDate: string): string {
  const date = new Date(isoDate)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

function groupByDate(transactions: Transaction[]): Map<string, Transaction[]> {
  const groups = new Map<string, Transaction[]>()
  for (const tx of transactions) {
    const dateKey = tx.date.split('T')[0]
    if (!groups.has(dateKey)) {
      groups.set(dateKey, [])
    }
    groups.get(dateKey)!.push(tx)
  }
  return groups
}

interface TransactionListProps {
  transactions: Transaction[]
  isLoading: boolean
  onTogglePaid: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (tx: Transaction) => void
  onAddClick: () => void
}

export function TransactionList({
  transactions,
  isLoading,
  onTogglePaid,
  onDelete,
  onEdit,
  onAddClick,
}: TransactionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground mb-4">
          Nenhuma transação neste ciclo
        </p>
        <button
          type="button"
          className="text-sm text-primary underline"
          onClick={onAddClick}
        >
          Registrar
        </button>
      </div>
    )
  }

  const groups = groupByDate(transactions)

  return (
    <div className="space-y-4">
      {Array.from(groups.entries()).map(([dateKey, txs]) => (
        <div key={dateKey}>
          <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase">
            {formatDateGroup(txs[0].date)}
          </h3>
          <ul className="space-y-2">
            {txs.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                onTogglePaid={onTogglePaid}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

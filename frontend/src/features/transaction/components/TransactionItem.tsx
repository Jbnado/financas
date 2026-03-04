import { Check, Pencil, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { InstallmentBadge } from './InstallmentBadge'
import type { Transaction } from '../types'

function formatCurrency(amount: string): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(parseFloat(amount))
}

function splitSummary(tx: Transaction): string {
  const splits = tx.splits ?? []
  if (splits.length === 0) return ''

  const totalAmount = parseFloat(tx.amount) || 0
  const splitsTotal = splits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0)

  // Lend mode: single split ≈ total amount
  if (splits.length === 1 && Math.abs(splitsTotal - totalAmount) < 0.01) {
    return `Conta de ${splits[0].person.name}`
  }

  // Split mode: show each person's share + user's share
  const parts = splits.map(
    (s) => `${s.person.name}: ${formatCurrency(s.amount)}`,
  )
  const userAmount = Math.max(0, totalAmount - splitsTotal).toFixed(2)
  parts.push(`Eu: ${formatCurrency(userAmount)}`)
  return parts.join(' · ')
}

interface TransactionItemProps {
  transaction: Transaction
  onTogglePaid: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (tx: Transaction) => void
}

export function TransactionItem({ transaction, onTogglePaid, onDelete, onEdit }: TransactionItemProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleDelete() {
    if (confirmDelete) {
      onDelete(transaction.id)
      setConfirmDelete(false)
    } else {
      setConfirmDelete(true)
    }
  }

  return (
    <li className="flex items-center justify-between rounded-lg border border-border p-3">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className="h-3 w-3 rounded-full shrink-0"
          style={{ backgroundColor: transaction.category.color ?? '#6b7280' }}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{transaction.description}</p>
          <p className="text-xs text-muted-foreground truncate">
            {transaction.paymentMethod.name} · {transaction.category.name}
          </p>
          {transaction.splits && transaction.splits.length > 0 && (
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
              <Users className="h-3 w-3 shrink-0" />
              <span>{splitSummary(transaction)}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        {transaction.totalInstallments && transaction.totalInstallments > 1 && transaction.installmentNumber && (
          <InstallmentBadge
            installmentNumber={transaction.installmentNumber}
            totalInstallments={transaction.totalInstallments}
          />
        )}

        <span className="text-sm font-medium tabular-nums whitespace-nowrap">
          {formatCurrency(transaction.amount)}
        </span>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Editar"
          onClick={() => onEdit(transaction)}
        >
          <Pencil className="h-4 w-4 text-muted-foreground" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label={transaction.isPaid ? 'Marcar como não pago' : 'Marcar como pago'}
          onClick={() => onTogglePaid(transaction.id)}
        >
          <Check
            className={`h-4 w-4 ${transaction.isPaid ? 'text-green-400' : 'text-muted-foreground'}`}
          />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Excluir"
          onClick={handleDelete}
        >
          <Trash2
            className={`h-4 w-4 ${confirmDelete ? 'text-destructive' : ''}`}
          />
        </Button>
      </div>
    </li>
  )
}

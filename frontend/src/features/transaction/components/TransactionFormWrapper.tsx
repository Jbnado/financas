import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/shared/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog'
import { useCycleStore } from '@/features/billing-cycle/stores/cycle.store'
import { useTransactions, useTransaction } from '../hooks/use-transactions'
import { useReceivables } from '@/features/split/hooks/use-receivables'
import { useTransactionFormStore } from '../stores/transaction-form.store'
import { TransactionForm } from './TransactionForm'
import { formatCurrency } from '@/shared/utils/currency'
import type { SplitInput } from '@/features/split/types'

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768,
  )

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return isDesktop
}

export function TransactionFormWrapper() {
  const isDesktop = useIsDesktop()
  const cycleId = useCycleStore((s) => s.selectedCycleId)
  const { isOpen, editingTransaction, close } = useTransactionFormStore()
  const { createTransaction, updateTransaction, deleteTransaction, replaceSplits, isCreating, isUpdating } = useTransactions(cycleId ?? undefined)
  const { createSplits } = useReceivables()

  const isEditing = !!editingTransaction
  const { data: transactionDetail } = useTransaction(editingTransaction?.id)

  async function handleSubmit(data: {
    description: string
    amount: string
    paymentMethodId: string
    categoryId: string
    totalInstallments?: number
    notes?: string
    splits?: SplitInput[]
  }) {
    if (!cycleId) {
      toast.error('Nenhum ciclo selecionado')
      return
    }

    if (isEditing && editingTransaction) {
      // Update existing transaction
      await updateTransaction({
        id: editingTransaction.id,
        data: {
          description: data.description,
          amount: data.amount,
          categoryId: data.categoryId,
          paymentMethodId: data.paymentMethodId,
        },
      })

      // Replace splits
      if (data.splits && data.splits.length > 0) {
        await replaceSplits({ id: editingTransaction.id, splits: data.splits })
      } else if (transactionDetail?.splits && transactionDetail.splits.length > 0) {
        // Had splits before but now has none — replace with empty to clear
        // The backend requires at least 1 split for replaceSplits, so we skip if removing all
        // Splits will remain as-is if user didn't change them
      }

      close()
      toast.success(`Atualizado — ${data.description} ${formatCurrency(data.amount)}`)
      return
    }

    // Create new transaction
    const result = await createTransaction({
      description: data.description,
      amount: data.amount,
      date: new Date().toISOString(),
      billingCycleId: cycleId,
      categoryId: data.categoryId,
      paymentMethodId: data.paymentMethodId,
      totalInstallments: data.totalInstallments,
    })

    // Create splits after transaction is created
    if (data.splits && data.splits.length > 0) {
      await createSplits({ transactionId: result.id, splits: data.splits })
    }

    close()

    const installmentInfo =
      result.totalInstallments && result.totalInstallments > 1
        ? ` · ${result.installmentNumber} de ${result.totalInstallments} parcelas (total: ${formatCurrency(data.amount)})`
        : ''

    toast.success(`Registrado — ${data.description} ${formatCurrency(result.amount)}${installmentInfo}`, {
      action: {
        label: 'Desfazer',
        onClick: () => { deleteTransaction(result.id).catch(() => {}) },
      },
      duration: 5000,
    })
  }

  const title = isEditing ? 'Editar Transação' : 'Nova Transação'
  const description = isEditing ? 'Altere os dados da transação' : 'Registre um novo gasto ou despesa'

  const formContent = (
    <TransactionForm
      key={editingTransaction?.id ?? 'new'}
      onSubmit={handleSubmit}
      isSubmitting={isEditing ? isUpdating : isCreating}
      transaction={isEditing ? transactionDetail : null}
    />
  )

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
        <DialogContent className="max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader className="mb-4">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        {formContent}
      </SheetContent>
    </Sheet>
  )
}

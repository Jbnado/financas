import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { CycleSelector } from '@/features/billing-cycle/components/CycleSelector'
import { BillingCycleForm } from '@/features/billing-cycle/components/BillingCycleForm'
import { ResponsiveFormContainer } from '@/features/billing-cycle/components/ResponsiveFormContainer'
import { useBillingCycles, useCreateBillingCycle } from '@/features/billing-cycle/hooks/use-billing-cycles'
import { useCycleNavigation } from '@/features/billing-cycle/hooks/use-cycle-navigation'
import { useCycleStore } from '@/features/billing-cycle/stores/cycle.store'
import { useTransactions } from '../hooks/use-transactions'
import { useTransactionFormStore } from '../stores/transaction-form.store'
import { TransactionList } from '../components/TransactionList'
import { TransactionFilters } from '../components/TransactionFilters'
import type { TransactionFilters as TFilters } from '../types'
import type { CreateBillingCycleDto } from '@/features/billing-cycle/types'

export default function TransacoesPage() {
  const { data: cycles = [], isLoading: cyclesLoading } = useBillingCycles()
  const createMutation = useCreateBillingCycle()
  const setSelectedCycleId = useCycleStore((s) => s.setSelectedCycleId)
  const [formOpen, setFormOpen] = useState(false)

  const {
    currentCycle,
    isFirst,
    isLast,
    goNext,
    goPrev,
  } = useCycleNavigation(cycles)

  useEffect(() => {
    if (currentCycle) {
      setSelectedCycleId(currentCycle.id)
    }
  }, [currentCycle, setSelectedCycleId])

  const openEdit = useTransactionFormStore((s) => s.openEdit)

  const [filters, setFilters] = useState<TFilters>({})

  const {
    transactions,
    isLoading: txLoading,
    togglePaid,
    deleteTransaction,
  } = useTransactions(currentCycle?.id, filters)

  function handleCreateCycle(data: CreateBillingCycleDto) {
    createMutation.mutate(data, {
      onSuccess: () => {
        setFormOpen(false)
        toast.success('Ciclo criado com sucesso')
      },
    })
  }

  return (
    <div className="flex flex-1 flex-col p-4 gap-4 max-w-2xl mx-auto w-full">
      {cycles.length > 0 && (
        <CycleSelector
          startDate={currentCycle?.startDate ?? ''}
          endDate={currentCycle?.endDate ?? ''}
          cycleName={currentCycle?.name}
          cycleStatus={currentCycle?.status}
          isFirst={isFirst}
          isLast={isLast}
          isLoading={cyclesLoading}
          onPrev={goPrev}
          onNext={goNext}
          onNew={() => setFormOpen(true)}
        />
      )}

      <TransactionFilters filters={filters} onChange={setFilters} />

      <TransactionList
        transactions={transactions}
        isLoading={txLoading}
        onTogglePaid={(id) => { togglePaid(id).catch(() => {}) }}
        onDelete={(id) => { deleteTransaction(id).catch(() => {}) }}
        onEdit={openEdit}
        onAddClick={() => {}}
      />

      <ResponsiveFormContainer
        open={formOpen}
        onOpenChange={setFormOpen}
        title="Novo Ciclo"
        description="Crie um novo ciclo de fatura"
      >
        <BillingCycleForm
          onSubmit={handleCreateCycle}
          onCancel={() => setFormOpen(false)}
          isSubmitting={createMutation.isPending}
        />
      </ResponsiveFormContainer>
    </div>
  )
}

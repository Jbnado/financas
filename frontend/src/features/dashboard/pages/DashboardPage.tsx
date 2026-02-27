import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { CycleSelector } from '@/features/billing-cycle/components/CycleSelector'
import { BillingCycleForm } from '@/features/billing-cycle/components/BillingCycleForm'
import { CloseCycleDialog } from '@/features/billing-cycle/components/CloseCycleDialog'
import { ResponsiveFormContainer } from '@/features/billing-cycle/components/ResponsiveFormContainer'
import { useBillingCycles, useCreateBillingCycle } from '@/features/billing-cycle/hooks/use-billing-cycles'
import { useCloseBillingCycle } from '@/features/billing-cycle/hooks/use-close-billing-cycle'
import { useCycleNavigation } from '@/features/billing-cycle/hooks/use-cycle-navigation'
import { useCycleStore } from '@/features/billing-cycle/stores/cycle.store'
import type { CreateBillingCycleDto } from '@/features/billing-cycle/types'

export default function DashboardPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [closeDialogOpen, setCloseDialogOpen] = useState(false)
  const { data: cycles = [], isLoading } = useBillingCycles()
  const createMutation = useCreateBillingCycle()
  const closeMutation = useCloseBillingCycle()
  const setSelectedCycleId = useCycleStore((s) => s.setSelectedCycleId)

  const {
    currentCycle,
    isFirst,
    isLast,
    goNext,
    goPrev,
  } = useCycleNavigation(cycles)

  function handleCreate(data: CreateBillingCycleDto) {
    createMutation.mutate(data, {
      onSuccess: () => {
        setFormOpen(false)
        toast.success('Ciclo criado com sucesso')
      },
    })
  }

  function handleClose() {
    if (!currentCycle) return
    closeMutation.mutate(currentCycle.id, {
      onSuccess: () => {
        setCloseDialogOpen(false)
        toast.success('Ciclo fechado')
        if (!isLast) goNext()
      },
    })
  }

  if (!isLoading && cycles.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <p className="text-lg text-muted-foreground">Nenhum ciclo encontrado</p>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Crie seu primeiro ciclo
        </Button>
        <ResponsiveFormContainer
          open={formOpen}
          onOpenChange={setFormOpen}
          title="Novo Ciclo"
          description="Crie um novo ciclo de fatura"
        >
          <BillingCycleForm
            onSubmit={handleCreate}
            onCancel={() => setFormOpen(false)}
            isSubmitting={createMutation.isPending}
          />
        </ResponsiveFormContainer>
      </div>
    )
  }

  if (currentCycle) {
    setSelectedCycleId(currentCycle.id)
  }

  return (
    <div className="flex flex-1 flex-col p-4">
      <div className="mb-6 flex items-center justify-between">
        <CycleSelector
          startDate={currentCycle?.startDate ?? ''}
          endDate={currentCycle?.endDate ?? ''}
          isFirst={isFirst}
          isLast={isLast}
          isLoading={isLoading}
          onPrev={goPrev}
          onNext={goNext}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setFormOpen(true)}
          aria-label="Novo ciclo"
          className="h-10 w-10"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <p className="text-lg text-muted-foreground">Dashboard — Em breve</p>
      </div>

      {currentCycle?.status === 'open' && (
        <div className="mt-4 flex justify-center pb-4">
          <Button
            variant="destructive"
            onClick={() => setCloseDialogOpen(true)}
          >
            Fechar Ciclo
          </Button>
        </div>
      )}

      <ResponsiveFormContainer
        open={formOpen}
        onOpenChange={setFormOpen}
        title="Novo Ciclo"
        description="Crie um novo ciclo de fatura"
      >
        <BillingCycleForm
          onSubmit={handleCreate}
          onCancel={() => setFormOpen(false)}
          isSubmitting={createMutation.isPending}
        />
      </ResponsiveFormContainer>

      <CloseCycleDialog
        open={closeDialogOpen}
        cycleName={currentCycle?.name ?? ''}
        onConfirm={handleClose}
        onCancel={() => setCloseDialogOpen(false)}
        isClosing={closeMutation.isPending}
      />
    </div>
  )
}

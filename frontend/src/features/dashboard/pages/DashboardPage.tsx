import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { CycleSelector } from '@/features/billing-cycle/components/CycleSelector'
import { BillingCycleForm } from '@/features/billing-cycle/components/BillingCycleForm'
import { CloseCycleDialog } from '@/features/billing-cycle/components/CloseCycleDialog'
import { ResponsiveFormContainer } from '@/features/billing-cycle/components/ResponsiveFormContainer'
import { useBillingCycles, useCreateBillingCycle, useUpdateBillingCycle } from '@/features/billing-cycle/hooks/use-billing-cycles'
import { useCloseBillingCycle } from '@/features/billing-cycle/hooks/use-close-billing-cycle'
import { useCycleNavigation } from '@/features/billing-cycle/hooks/use-cycle-navigation'
import { useCycleStore } from '@/features/billing-cycle/stores/cycle.store'
import { DashboardContent } from '../components/DashboardContent'
import type { CreateBillingCycleDto } from '@/features/billing-cycle/types'

export default function DashboardPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [closeDialogOpen, setCloseDialogOpen] = useState(false)
  const { data: cycles = [], isLoading } = useBillingCycles()
  const createMutation = useCreateBillingCycle()
  const updateMutation = useUpdateBillingCycle()
  const closeMutation = useCloseBillingCycle()
  const setSelectedCycleId = useCycleStore((s) => s.setSelectedCycleId)

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

  function handleOpenCreate() {
    setIsEditMode(false)
    setFormOpen(true)
  }

  function handleOpenEdit() {
    setIsEditMode(true)
    setFormOpen(true)
  }

  function handleSubmit(data: CreateBillingCycleDto) {
    if (isEditMode && currentCycle) {
      updateMutation.mutate(
        { id: currentCycle.id, dto: data },
        {
          onSuccess: () => {
            setFormOpen(false)
            toast.success('Ciclo atualizado')
          },
        },
      )
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          setFormOpen(false)
          toast.success('Ciclo criado com sucesso')
        },
      })
    }
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
        <Button onClick={handleOpenCreate}>
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
            onSubmit={handleSubmit}
            onCancel={() => setFormOpen(false)}
            isSubmitting={createMutation.isPending}
          />
        </ResponsiveFormContainer>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col p-4">
      <div className="mb-6 flex items-center justify-center">
        <CycleSelector
          startDate={currentCycle?.startDate ?? ''}
          endDate={currentCycle?.endDate ?? ''}
          cycleName={currentCycle?.name}
          cycleStatus={currentCycle?.status}
          isFirst={isFirst}
          isLast={isLast}
          isLoading={isLoading}
          onPrev={goPrev}
          onNext={goNext}
          onEdit={handleOpenEdit}
          onNew={handleOpenCreate}
        />
      </div>

      <DashboardContent cycleId={currentCycle?.id} />

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
        title={isEditMode ? 'Editar Ciclo' : 'Novo Ciclo'}
        description={isEditMode ? 'Altere os dados do ciclo.' : 'Crie um novo ciclo de fatura'}
      >
        <BillingCycleForm
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          cycle={isEditMode ? currentCycle : null}
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

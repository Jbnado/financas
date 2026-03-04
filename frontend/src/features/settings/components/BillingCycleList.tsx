import { useState } from 'react'
import { Pencil, Plus, Lock, LockOpen } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  useBillingCycles,
  useCreateBillingCycle,
  useUpdateBillingCycle,
  useReopenBillingCycle,
} from '@/features/billing-cycle/hooks/use-billing-cycles'
import { useCloseBillingCycle } from '@/features/billing-cycle/hooks/use-close-billing-cycle'
import { BillingCycleForm } from '@/features/billing-cycle/components/BillingCycleForm'
import { CloseCycleDialog } from '@/features/billing-cycle/components/CloseCycleDialog'
import { ResponsiveFormContainer } from '@/features/billing-cycle/components/ResponsiveFormContainer'
import type { BillingCycle, CreateBillingCycleDto, UpdateBillingCycleDto } from '@/features/billing-cycle/types'

function formatCycleDate(isoDate: string): string {
  const date = new Date(isoDate)
  const day = date.getUTCDate()
  const month = new Intl.DateTimeFormat('pt-BR', {
    month: 'short',
    timeZone: 'UTC',
  }).format(date)
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1).replace('.', '')
  return `${day}/${capitalizedMonth}`
}

function formatSalary(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function BillingCycleList() {
  const { data: cycles, isLoading } = useBillingCycles()
  const createMutation = useCreateBillingCycle()
  const updateMutation = useUpdateBillingCycle()
  const closeMutation = useCloseBillingCycle()
  const reopenMutation = useReopenBillingCycle()

  const [showForm, setShowForm] = useState(false)
  const [editingCycle, setEditingCycle] = useState<BillingCycle | null>(null)
  const [closingCycle, setClosingCycle] = useState<BillingCycle | null>(null)

  const handleAdd = () => {
    setEditingCycle(null)
    setShowForm(true)
  }

  const handleEdit = (cycle: BillingCycle) => {
    setEditingCycle(cycle)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingCycle(null)
  }

  const handleSubmit = (data: CreateBillingCycleDto) => {
    if (editingCycle) {
      const dto: UpdateBillingCycleDto = data
      updateMutation.mutate(
        { id: editingCycle.id, dto },
        {
          onSuccess: () => {
            handleFormClose()
            toast.success('Ciclo atualizado')
          },
          onError: () => toast.error('Erro ao atualizar ciclo'),
        },
      )
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          handleFormClose()
          toast.success('Ciclo criado')
        },
        onError: () => toast.error('Erro ao criar ciclo'),
      })
    }
  }

  const handleClose = () => {
    if (!closingCycle) return
    closeMutation.mutate(closingCycle.id, {
      onSuccess: () => {
        setClosingCycle(null)
        toast.success('Ciclo fechado')
      },
      onError: () => toast.error('Erro ao fechar ciclo'),
    })
  }

  const handleReopen = (cycle: BillingCycle) => {
    reopenMutation.mutate(cycle.id, {
      onSuccess: () => toast.success('Ciclo reaberto'),
      onError: () => toast.error('Erro ao reabrir ciclo'),
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ciclos de Cobrança</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base">Ciclos de Cobrança</CardTitle>
          <Button size="sm" onClick={handleAdd} aria-label="Adicionar">
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent>
          {!cycles?.length ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum ciclo cadastrado
            </p>
          ) : (
            <ul className="space-y-2">
              {cycles.map((cycle) => (
                <li
                  key={cycle.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{cycle.name}</span>
                      <Badge variant={cycle.status === 'open' ? 'default' : 'secondary'}>
                        {cycle.status === 'open' ? 'Aberto' : 'Fechado'}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatCycleDate(cycle.startDate)} — {formatCycleDate(cycle.endDate)}
                      {' · '}
                      {formatSalary(cycle.salary)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {cycle.status === 'open' ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Editar"
                          onClick={() => handleEdit(cycle)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Fechar ciclo"
                          onClick={() => setClosingCycle(cycle)}
                        >
                          <Lock className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Reabrir ciclo"
                        disabled={reopenMutation.isPending}
                        onClick={() => handleReopen(cycle)}
                      >
                        <LockOpen className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <ResponsiveFormContainer
        open={showForm}
        onOpenChange={(open) => !open && handleFormClose()}
        title={editingCycle ? 'Editar Ciclo' : 'Novo Ciclo'}
        description={editingCycle ? 'Altere os dados do ciclo.' : 'Crie um novo ciclo de fatura.'}
      >
        <BillingCycleForm
          onSubmit={handleSubmit}
          onCancel={handleFormClose}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          cycle={editingCycle}
        />
      </ResponsiveFormContainer>

      <CloseCycleDialog
        open={!!closingCycle}
        cycleName={closingCycle?.name ?? ''}
        onConfirm={handleClose}
        onCancel={() => setClosingCycle(null)}
        isClosing={closeMutation.isPending}
      />
    </>
  )
}

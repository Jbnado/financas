import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog'
import { useFixedExpenses } from '../hooks/use-fixed-expenses'
import type { FixedExpense } from '../types'

interface FixedExpenseFormValues {
  name: string
  estimatedAmount: string
  dueDay: string
}

interface FixedExpenseFormDialogProps {
  open: boolean
  onClose: () => void
  expense: FixedExpense | null
}

export function FixedExpenseFormDialog({ open, onClose, expense }: FixedExpenseFormDialogProps) {
  const { createFixedExpense, updateFixedExpense, isCreating, isUpdating } = useFixedExpenses()
  const isEditing = !!expense

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FixedExpenseFormValues>({
    defaultValues: {
      name: '',
      estimatedAmount: '',
      dueDay: '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: expense?.name ?? '',
        estimatedAmount: expense?.estimatedAmount ?? '',
        dueDay: expense?.dueDay?.toString() ?? '',
      })
    }
  }, [open, expense, reset])

  const onSubmit = async (data: FixedExpenseFormValues) => {
    try {
      const payload = {
        name: data.name,
        estimatedAmount: data.estimatedAmount,
        dueDay: Number(data.dueDay),
      }
      if (isEditing) {
        await updateFixedExpense({ id: expense.id, data: payload })
        toast.success('Gasto fixo atualizado')
      } else {
        await createFixedExpense(payload)
        toast.success('Gasto fixo criado')
      }
      onClose()
    } catch {
      toast.error(isEditing ? 'Erro ao atualizar gasto fixo' : 'Erro ao criar gasto fixo')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Gasto Fixo' : 'Novo Gasto Fixo'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Altere os dados do gasto fixo' : 'Preencha os dados do novo gasto fixo'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="fe-name" className="text-sm font-medium">
              Nome
            </label>
            <Input
              id="fe-name"
              {...register('name', { required: 'Nome é obrigatório' })}
              placeholder="Ex: Aluguel"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="fe-amount" className="text-sm font-medium">
              Valor Estimado
            </label>
            <Input
              id="fe-amount"
              {...register('estimatedAmount', { required: 'Valor é obrigatório' })}
              placeholder="Ex: 1500.00"
              inputMode="decimal"
            />
            {errors.estimatedAmount && (
              <p className="text-sm text-destructive">{errors.estimatedAmount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="fe-dueday" className="text-sm font-medium">
              Dia de Vencimento
            </label>
            <Input
              id="fe-dueday"
              type="number"
              {...register('dueDay', {
                required: 'Dia é obrigatório',
                min: { value: 1, message: 'Mínimo 1' },
                max: { value: 31, message: 'Máximo 31' },
              })}
              placeholder="Ex: 10"
            />
            {errors.dueDay && (
              <p className="text-sm text-destructive">{errors.dueDay.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {isCreating || isUpdating
                ? 'Salvando...'
                : isEditing
                  ? 'Salvar'
                  : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

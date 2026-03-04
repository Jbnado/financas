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
import { useTaxes } from '../hooks/use-taxes'
import type { Tax } from '../types'

interface TaxFormValues {
  name: string
  rate: string
  estimatedAmount: string
}

interface TaxFormDialogProps {
  open: boolean
  onClose: () => void
  tax: Tax | null
}

export function TaxFormDialog({ open, onClose, tax }: TaxFormDialogProps) {
  const { createTax, updateTax, isCreating, isUpdating } = useTaxes()
  const isEditing = !!tax

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaxFormValues>({
    defaultValues: {
      name: '',
      rate: '',
      estimatedAmount: '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: tax?.name ?? '',
        rate: tax?.rate ?? '',
        estimatedAmount: tax?.estimatedAmount ?? '',
      })
    }
  }, [open, tax, reset])

  const onSubmit = async (data: TaxFormValues) => {
    try {
      const payload = {
        name: data.name,
        rate: data.rate,
        estimatedAmount: data.estimatedAmount,
      }
      if (isEditing) {
        await updateTax({ id: tax.id, data: payload })
        toast.success('Imposto atualizado')
      } else {
        await createTax(payload)
        toast.success('Imposto criado')
      }
      onClose()
    } catch {
      toast.error(isEditing ? 'Erro ao atualizar imposto' : 'Erro ao criar imposto')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Imposto' : 'Novo Imposto'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Altere os dados do imposto' : 'Preencha os dados do novo imposto'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="tax-name" className="text-sm font-medium">
              Nome
            </label>
            <Input
              id="tax-name"
              {...register('name', { required: 'Nome é obrigatório' })}
              placeholder="Ex: DAS"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="tax-rate" className="text-sm font-medium">
              Alíquota (%)
            </label>
            <Input
              id="tax-rate"
              {...register('rate', { required: 'Alíquota é obrigatória' })}
              placeholder="Ex: 6.00"
              inputMode="decimal"
            />
            {errors.rate && (
              <p className="text-sm text-destructive">{errors.rate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="tax-amount" className="text-sm font-medium">
              Valor Estimado
            </label>
            <Input
              id="tax-amount"
              {...register('estimatedAmount', { required: 'Valor é obrigatório' })}
              placeholder="Ex: 500.00"
              inputMode="decimal"
            />
            {errors.estimatedAmount && (
              <p className="text-sm text-destructive">{errors.estimatedAmount.message}</p>
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

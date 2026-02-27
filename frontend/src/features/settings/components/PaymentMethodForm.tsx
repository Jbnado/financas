import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import type { PaymentMethod, CreatePaymentMethodData, UpdatePaymentMethodData } from '../types'

interface PaymentMethodFormProps {
  onSubmit: (data: CreatePaymentMethodData | UpdatePaymentMethodData) => void
  onCancel: () => void
  editingMethod?: PaymentMethod
}

interface FormValues {
  name: string
  type: 'credit' | 'debit'
  dueDay: string
}

export function PaymentMethodForm({ onSubmit, onCancel, editingMethod }: PaymentMethodFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: editingMethod?.name ?? '',
      type: editingMethod?.type ?? 'credit',
      dueDay: editingMethod?.dueDay != null ? String(editingMethod.dueDay) : '',
    },
  })

  useEffect(() => {
    reset({
      name: editingMethod?.name ?? '',
      type: editingMethod?.type ?? 'credit',
      dueDay: editingMethod?.dueDay != null ? String(editingMethod.dueDay) : '',
    })
  }, [editingMethod, reset])

  function onFormSubmit(values: FormValues) {
    if (editingMethod) {
      const data: UpdatePaymentMethodData = {
        name: values.name,
        type: values.type,
        dueDay: values.dueDay !== '' ? Number(values.dueDay) : null,
      }
      onSubmit(data)
    } else {
      const data: CreatePaymentMethodData = {
        name: values.name,
        type: values.type,
      }
      if (values.dueDay !== '') {
        data.dueDay = Number(values.dueDay)
      }
      onSubmit(data)
    }
  }

  return (
    <form role="form" onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="pm-name" className="block text-sm font-medium mb-1">
          Nome
        </label>
        <Input
          id="pm-name"
          {...register('name', { required: 'Nome é obrigatório' })}
          placeholder="Ex: Nubank"
        />
        {errors.name && (
          <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="pm-type" className="block text-sm font-medium mb-1">
          Tipo
        </label>
        <select
          id="pm-type"
          {...register('type')}
          className="flex h-10 w-full rounded-xl border border-border bg-input px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="credit">Crédito</option>
          <option value="debit">Débito</option>
        </select>
      </div>

      <div>
        <label htmlFor="pm-dueDay" className="block text-sm font-medium mb-1">
          Dia de vencimento
        </label>
        <Input
          id="pm-dueDay"
          type="number"
          {...register('dueDay', {
            min: { value: 1, message: 'Mínimo 1' },
            max: { value: 31, message: 'Máximo 31' },
          })}
          min={1}
          max={31}
          placeholder="Opcional (1-31)"
        />
        {errors.dueDay && (
          <p className="text-sm text-destructive mt-1">{errors.dueDay.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {editingMethod ? 'Salvar' : 'Adicionar'}
        </Button>
      </div>
    </form>
  )
}

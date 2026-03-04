import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import type { BillingCycle, CreateBillingCycleDto } from '../types'

interface FormValues {
  name: string
  startDate: string
  endDate: string
  salary: string
}

interface BillingCycleFormProps {
  onSubmit: (data: CreateBillingCycleDto) => void
  onCancel: () => void
  isSubmitting: boolean
  cycle?: BillingCycle | null
}

function toDateInput(iso: string): string {
  return iso.slice(0, 10)
}

function formatSalaryForDisplay(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return ''
  return num.toFixed(2).replace('.', ',')
}

export function BillingCycleForm({ onSubmit, onCancel, isSubmitting, cycle }: BillingCycleFormProps) {
  const isEdit = !!cycle

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm<FormValues>()

  useEffect(() => {
    if (cycle) {
      reset({
        name: cycle.name,
        startDate: toDateInput(cycle.startDate),
        endDate: toDateInput(cycle.endDate),
        salary: formatSalaryForDisplay(cycle.salary),
      })
    } else {
      reset({ name: '', startDate: '', endDate: '', salary: '' })
    }
  }, [cycle, reset])

  function handleFormSubmit(values: FormValues) {
    const salary = values.salary.replace(/[R$\s.]/g, '').replace(',', '.')
    onSubmit({
      name: values.name,
      startDate: new Date(values.startDate + 'T00:00:00.000Z').toISOString(),
      endDate: new Date(values.endDate + 'T00:00:00.000Z').toISOString(),
      salary: salary || values.salary,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-foreground">
          Nome
        </label>
        <Input
          id="name"
          placeholder="Ex: Fevereiro 2026"
          {...register('name', { required: 'Nome é obrigatório' })}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="startDate" className="text-sm font-medium text-foreground">
          Data Início
        </label>
        <Input
          id="startDate"
          type="date"
          {...register('startDate', { required: 'Data início é obrigatória' })}
        />
        {errors.startDate && (
          <p className="text-sm text-destructive">{errors.startDate.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="endDate" className="text-sm font-medium text-foreground">
          Data Fim
        </label>
        <Input
          id="endDate"
          type="date"
          {...register('endDate', {
            required: 'Data fim é obrigatória',
            validate: (v) => {
              const start = getValues('startDate')
              if (start && v && v <= start) return 'Data fim deve ser posterior à data início'
              return true
            },
          })}
        />
        {errors.endDate && (
          <p className="text-sm text-destructive">{errors.endDate.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="salary" className="text-sm font-medium text-foreground">
          Salário
        </label>
        <Input
          id="salary"
          inputMode="decimal"
          placeholder="R$ 0,00"
          {...register('salary', {
            required: 'Salário é obrigatório',
            validate: (v) => {
              const num = parseFloat(v.replace(/[R$\s.]/g, '').replace(',', '.'))
              return (!isNaN(num) && num > 0) || 'Salário deve ser maior que zero'
            },
          })}
        />
        {errors.salary && (
          <p className="text-sm text-destructive">{errors.salary.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? isEdit ? 'Salvando...' : 'Criando...'
            : isEdit ? 'Salvar' : 'Criar'}
        </Button>
      </div>
    </form>
  )
}

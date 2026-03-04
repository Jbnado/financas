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
import { useInvestments } from '../hooks/use-investments'
import type { Investment, InvestmentType, LiquidityType } from '../types'

interface InvestmentFormValues {
  name: string
  type: InvestmentType
  institution: string
  appliedAmount: string
  currentValue: string
  liquidity: LiquidityType
  maturityDate: string
}

interface InvestmentFormDialogProps {
  open: boolean
  onClose: () => void
  investment: Investment | null
}

const TYPE_OPTIONS: { value: InvestmentType; label: string }[] = [
  { value: 'fixed_income', label: 'Renda Fixa' },
  { value: 'variable_income', label: 'Renda Variável' },
  { value: 'crypto', label: 'Cripto' },
  { value: 'real_estate', label: 'Imóvel' },
  { value: 'other', label: 'Outro' },
]

const LIQUIDITY_OPTIONS: { value: LiquidityType; label: string }[] = [
  { value: 'daily', label: 'Diária' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'at_maturity', label: 'No Vencimento' },
]

export function InvestmentFormDialog({ open, onClose, investment }: InvestmentFormDialogProps) {
  const { createInvestment, updateInvestment, isCreating, isUpdating } = useInvestments()
  const isEditing = !!investment

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InvestmentFormValues>({
    defaultValues: {
      name: '',
      type: 'fixed_income',
      institution: '',
      appliedAmount: '0',
      currentValue: '0',
      liquidity: 'daily',
      maturityDate: '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: investment?.name ?? '',
        type: investment?.type ?? 'fixed_income',
        institution: investment?.institution ?? '',
        appliedAmount: investment ? String(Number(investment.appliedAmount)) : '0',
        currentValue: investment ? String(Number(investment.currentValue)) : '0',
        liquidity: investment?.liquidity ?? 'daily',
        maturityDate: investment?.maturityDate
          ? investment.maturityDate.slice(0, 10)
          : '',
      })
    }
  }, [open, investment, reset])

  const onSubmit = async (data: InvestmentFormValues) => {
    try {
      if (isEditing) {
        await updateInvestment({
          id: investment.id,
          data: {
            name: data.name,
            type: data.type,
            institution: data.institution,
            liquidity: data.liquidity,
            maturityDate: data.maturityDate || null,
          },
        })
        toast.success('Investimento atualizado')
      } else {
        await createInvestment({
          name: data.name,
          type: data.type,
          institution: data.institution,
          appliedAmount: Number(data.appliedAmount) || 0,
          currentValue: Number(data.currentValue) || 0,
          liquidity: data.liquidity,
          maturityDate: data.maturityDate || undefined,
        })
        toast.success('Investimento criado')
      }
      onClose()
    } catch {
      toast.error(isEditing ? 'Erro ao atualizar investimento' : 'Erro ao criar investimento')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Investimento' : 'Novo Investimento'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Altere os dados do investimento' : 'Preencha os dados do novo investimento'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="inv-name" className="text-sm font-medium">
              Nome
            </label>
            <Input
              id="inv-name"
              {...register('name', { required: 'Nome é obrigatório' })}
              placeholder="Ex: CDB Banco XYZ"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="inv-type" className="text-sm font-medium">
                Tipo
              </label>
              <select
                id="inv-type"
                {...register('type')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="inv-liquidity" className="text-sm font-medium">
                Liquidez
              </label>
              <select
                id="inv-liquidity"
                {...register('liquidity')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {LIQUIDITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="inv-institution" className="text-sm font-medium">
              Instituição
            </label>
            <Input
              id="inv-institution"
              {...register('institution', { required: 'Instituição é obrigatória' })}
              placeholder="Ex: Nubank"
            />
            {errors.institution && (
              <p className="text-sm text-destructive">{errors.institution.message}</p>
            )}
          </div>

          {!isEditing && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="inv-applied" className="text-sm font-medium">
                  Valor Aplicado
                </label>
                <Input
                  id="inv-applied"
                  type="number"
                  step="0.01"
                  {...register('appliedAmount')}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="inv-current" className="text-sm font-medium">
                  Valor Atual
                </label>
                <Input
                  id="inv-current"
                  type="number"
                  step="0.01"
                  {...register('currentValue')}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="inv-maturity" className="text-sm font-medium">
              Data de Vencimento (opcional)
            </label>
            <Input
              id="inv-maturity"
              type="date"
              {...register('maturityDate')}
            />
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

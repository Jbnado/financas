import { useEffect, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Loader2, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { useCategories } from '@/features/settings/hooks/use-categories'
import { usePaymentMethods } from '@/features/settings/hooks/use-payment-methods'
import { parseCurrencyToDecimal, formatCurrency } from '@/shared/utils/currency'
import { CurrencyInput } from './CurrencyInput'
import { SplitSection } from '@/features/split/components/SplitSection'
import type { SplitInput } from '@/features/split/types'
import type { TransactionDetail } from '../types'

export interface TransactionFormValues {
  description: string
  amountDigits: string
  paymentMethodId: string
  categoryId: string
  installments: number
  notes: string
}

interface TransactionFormProps {
  onSubmit: (data: {
    description: string
    amount: string
    paymentMethodId: string
    categoryId: string
    totalInstallments?: number
    notes?: string
    splits?: SplitInput[]
  }) => Promise<void>
  isSubmitting: boolean
  transaction?: TransactionDetail | null
}

function amountToDigits(amount: string): string {
  // Convert "160.00" to "16000" for CurrencyInput
  const num = parseFloat(amount)
  if (isNaN(num)) return ''
  return Math.round(num * 100).toString()
}

export function TransactionForm({ onSubmit, isSubmitting, transaction }: TransactionFormProps) {
  const { categories } = useCategories()
  const { paymentMethods } = usePaymentMethods()
  const isEditing = !!transaction

  const [showInstallments, setShowInstallments] = useState(false)
  const [showSplit, setShowSplit] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [splits, setSplits] = useState<SplitInput[]>([])
  const [initialSplitMode, setInitialSplitMode] = useState<'split' | 'lend'>('split')

  const descriptionRef = useRef<HTMLInputElement | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    defaultValues: {
      description: '',
      amountDigits: '',
      paymentMethodId: '',
      categoryId: '',
      installments: 2,
      notes: '',
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (transaction) {
      reset({
        description: transaction.description,
        amountDigits: amountToDigits(transaction.amount),
        paymentMethodId: transaction.paymentMethodId,
        categoryId: transaction.categoryId,
        installments: 2,
        notes: '',
      })

      if (transaction.splits && transaction.splits.length > 0) {
        const splitInputs = transaction.splits.map((s) => ({
          personId: s.personId,
          amount: s.amount,
        }))
        setSplits(splitInputs)
        setShowSplit(true)

        // Detect lend mode: single split with amount == transaction amount
        if (
          splitInputs.length === 1 &&
          parseFloat(splitInputs[0].amount) === parseFloat(transaction.amount)
        ) {
          setInitialSplitMode('lend')
        }
      }
    }
  }, [transaction, reset])

  useEffect(() => {
    if (paymentMethods.length > 0 && !isEditing) {
      reset((prev) => ({
        ...prev,
        paymentMethodId: prev.paymentMethodId || paymentMethods[0].id,
      }))
    }
  }, [paymentMethods, reset, isEditing])

  useEffect(() => {
    setTimeout(() => descriptionRef.current?.focus(), 100)
  }, [])

  const amountDigits = watch('amountDigits')
  const installments = watch('installments')

  const installmentValue =
    showInstallments && installments > 1 && amountDigits
      ? formatCurrency(
          (parseFloat(parseCurrencyToDecimal(amountDigits)) / installments).toFixed(2),
        )
      : null

  async function handleFormSubmit(data: TransactionFormValues) {
    const amount = parseCurrencyToDecimal(data.amountDigits)

    // Validate splits don't exceed total
    const validSplits = splits.filter((s) => s.personId && parseFloat(s.amount) > 0)
    const splitsTotal = validSplits.reduce((sum, s) => sum + parseFloat(s.amount), 0)
    if (showSplit && splitsTotal > parseFloat(amount)) {
      return
    }

    await onSubmit({
      description: data.description,
      amount,
      paymentMethodId: data.paymentMethodId,
      categoryId: data.categoryId,
      totalInstallments: !isEditing && showInstallments && data.installments > 1 ? data.installments : undefined,
      notes: !isEditing && showNotes && data.notes ? data.notes : undefined,
      splits: showSplit && validSplits.length > 0 ? validSplits : undefined,
    })
  }

  const { ref: descRHFRef, ...descRegister } = register('description', {
    required: 'Descrição é obrigatória',
  })

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="tx-description" className="text-sm font-medium">
          Descrição *
        </label>
        <Input
          id="tx-description"
          placeholder="Ex: Supermercado"
          ref={(e) => {
            descRHFRef(e)
            descriptionRef.current = e
          }}
          {...descRegister}
          className={errors.description ? 'border-red-400' : ''}
        />
        {errors.description && (
          <p className="text-xs text-red-400">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="tx-amount" className="text-sm font-medium">
          Valor *
        </label>
        <Controller
          name="amountDigits"
          control={control}
          rules={{
            validate: (v) => {
              const val = parseFloat(parseCurrencyToDecimal(v))
              return val > 0 || 'Valor deve ser maior que zero'
            },
          }}
          render={({ field }) => (
            <CurrencyInput
              id="tx-amount"
              value={field.value}
              onChange={field.onChange}
              hasError={!!errors.amountDigits}
            />
          )}
        />
        {errors.amountDigits && (
          <p className="text-xs text-red-400">{errors.amountDigits.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="tx-payment-method" className="text-sm font-medium">
          Cartão *
        </label>
        <select
          id="tx-payment-method"
          {...register('paymentMethodId', { required: 'Cartão é obrigatório' })}
          className={`flex h-10 w-full rounded-xl border bg-input px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.paymentMethodId ? 'border-red-400' : 'border-border'}`}
        >
          {paymentMethods.map((pm) => (
            <option key={pm.id} value={pm.id}>
              {pm.name}
            </option>
          ))}
        </select>
        {errors.paymentMethodId && (
          <p className="text-xs text-red-400">{errors.paymentMethodId.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="tx-category" className="text-sm font-medium">
          Categoria *
        </label>
        <select
          id="tx-category"
          {...register('categoryId', { required: 'Categoria é obrigatória' })}
          className={`flex h-10 w-full rounded-xl border bg-input px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.categoryId ? 'border-red-400' : 'border-border'}`}
        >
          <option value="">Selecione...</option>
          {(categories ?? []).map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="text-xs text-red-400">{errors.categoryId.message}</p>
        )}
      </div>

      {/* Collapsible: Parcelar — hidden in edit mode */}
      {!isEditing && (
        <div className="border border-border rounded-xl overflow-hidden">
          <button
            type="button"
            className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium hover:bg-accent/50 transition-colors"
            onClick={() => setShowInstallments(!showInstallments)}
            aria-expanded={showInstallments}
          >
            Parcelar
            <ChevronRight
              className={`h-4 w-4 transition-transform duration-150 ${showInstallments ? 'rotate-90' : ''}`}
            />
          </button>
          <div
            className={`grid transition-all duration-150 ease-in-out ${showInstallments ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
          >
            <div className="overflow-hidden">
              <div className="px-3 pb-3 space-y-2">
                <label htmlFor="tx-installments" className="text-xs text-muted-foreground">
                  Número de parcelas
                </label>
                <Input
                  id="tx-installments"
                  type="number"
                  min={2}
                  max={48}
                  {...register('installments', {
                    valueAsNumber: true,
                    min: { value: 2, message: 'Mínimo 2' },
                    max: { value: 48, message: 'Máximo 48' },
                  })}
                />
                {installmentValue && (
                  <p className="text-xs text-muted-foreground">
                    Valor por parcela: {installmentValue}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collapsible: Dividir / Emprestar cartão */}
      <div className="border border-border rounded-xl overflow-hidden">
        <button
          type="button"
          className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium hover:bg-accent/50 transition-colors"
          onClick={() => setShowSplit(!showSplit)}
          aria-expanded={showSplit}
        >
          Dividir / Emprestar cartão
          <ChevronRight
            className={`h-4 w-4 transition-transform duration-150 ${showSplit ? 'rotate-90' : ''}`}
          />
        </button>
        <div
          className={`grid transition-all duration-150 ease-in-out ${showSplit ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
        >
          <div className="overflow-hidden">
            <div className="px-3 pb-3">
              <SplitSection
                splits={splits}
                onChange={setSplits}
                totalAmount={
                  showInstallments && installments > 1
                    ? (parseFloat(parseCurrencyToDecimal(amountDigits)) / installments).toFixed(2)
                    : parseCurrencyToDecimal(amountDigits)
                }
                initialMode={initialSplitMode}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible: Observação — hidden in edit mode */}
      {!isEditing && (
        <div className="border border-border rounded-xl overflow-hidden">
          <button
            type="button"
            className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium hover:bg-accent/50 transition-colors"
            onClick={() => setShowNotes(!showNotes)}
            aria-expanded={showNotes}
          >
            Observação
            <ChevronRight
              className={`h-4 w-4 transition-transform duration-150 ${showNotes ? 'rotate-90' : ''}`}
            />
          </button>
          <div
            className={`grid transition-all duration-150 ease-in-out ${showNotes ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
          >
            <div className="overflow-hidden">
              <div className="px-3 pb-3">
                <textarea
                  id="tx-notes"
                  {...register('notes')}
                  placeholder="Observações..."
                  rows={3}
                  className="flex w-full rounded-xl border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <Button
        type="submit"
        variant="gradient"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {isEditing ? 'Salvando...' : 'Registrando...'}
          </>
        ) : (
          isEditing ? 'Salvar' : 'Registrar'
        )}
      </Button>
    </form>
  )
}

import { useState } from 'react'
import { ArrowLeft, Check } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { formatCurrency } from '@/shared/utils/currency'
import { useReceivables } from '../hooks/use-receivables'
import type { Receivable } from '../types'

interface ReceivablesListProps {
  personId: string
  personName: string
  totalPending: string
  onBack: () => void
  cycleId?: string
}

export function ReceivablesList({ personId, personName, totalPending, onBack, cycleId }: ReceivablesListProps) {
  const { usePersonReceivables, createPayment, isCreatingPayment } = useReceivables(cycleId)
  const { data: receivables, isLoading } = usePersonReceivables(personId)

  const [payingReceivable, setPayingReceivable] = useState<Receivable | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')

  const pending = (receivables ?? []).filter((r) => r.status !== 'paid')

  async function handlePay() {
    if (!payingReceivable || !paymentAmount) return

    await createPayment({
      receivableId: payingReceivable.id,
      data: {
        amount: paymentAmount,
        paidAt: new Date().toISOString(),
      },
    })

    setPayingReceivable(null)
    setPaymentAmount('')
  }

  function openPayDialog(receivable: Receivable) {
    const remaining = (parseFloat(receivable.amount) - parseFloat(receivable.paidAmount)).toFixed(2)
    setPaymentAmount(remaining)
    setPayingReceivable(receivable)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onBack} className="p-1 hover:bg-accent rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex flex-1 items-center justify-between">
          <span className="text-sm font-semibold">{personName}</span>
          <span className="text-sm font-semibold text-[#6ee7a0]">
            {formatCurrency(totalPending)}
          </span>
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}

      {!isLoading && pending.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhum valor pendente
        </p>
      )}

      <div className="space-y-2">
        {pending.map((r) => {
          const remaining = (parseFloat(r.amount) - parseFloat(r.paidAmount)).toFixed(2)
          return (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-3"
            >
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{r.split.transaction.description}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(r.split.transaction.date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#6ee7a0]">
                  {formatCurrency(remaining)}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openPayDialog(r)}
                  className="h-8 text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Pagar
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <Dialog
        open={!!payingReceivable}
        onOpenChange={(open) => !open && setPayingReceivable(null)}
      >
        <DialogContent className="max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Registrar pagamento</DialogTitle>
            <DialogDescription>
              {payingReceivable && `${payingReceivable.split.transaction.description}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="pay-amount" className="text-sm font-medium">
                Valor
              </label>
              <Input
                id="pay-amount"
                type="number"
                step="0.01"
                min="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              variant="gradient"
              onClick={handlePay}
              disabled={isCreatingPayment || !paymentAmount || parseFloat(paymentAmount) <= 0}
            >
              {isCreatingPayment ? 'Registrando...' : 'Confirmar pagamento'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog'
import { usePaymentMethods } from '../hooks/use-payment-methods'
import { PaymentMethodList } from '../components/PaymentMethodList'
import { PaymentMethodForm } from '../components/PaymentMethodForm'
import type { PaymentMethod, CreatePaymentMethodData, UpdatePaymentMethodData } from '../types'

export default function ConfigPage() {
  const {
    paymentMethods,
    isLoading,
    createPaymentMethod,
    updatePaymentMethod,
    removePaymentMethod,
  } = usePaymentMethods()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | undefined>()

  function handleAdd() {
    setEditingMethod(undefined)
    setDialogOpen(true)
  }

  function handleEdit(method: PaymentMethod) {
    setEditingMethod(method)
    setDialogOpen(true)
  }

  async function handleSubmit(data: CreatePaymentMethodData | UpdatePaymentMethodData) {
    try {
      if (editingMethod) {
        await updatePaymentMethod({ id: editingMethod.id, data })
      } else {
        await createPaymentMethod(data as CreatePaymentMethodData)
      }
      setDialogOpen(false)
      setEditingMethod(undefined)
    } catch {
      // toast is handled by mutation onError
    }
  }

  function handleCancel() {
    setDialogOpen(false)
    setEditingMethod(undefined)
  }

  return (
    <div className="flex flex-1 flex-col p-4 gap-6 max-w-2xl mx-auto w-full">
      <h1 className="text-2xl font-bold">Configurações</h1>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Meios de Pagamento</h2>
          <Button size="sm" onClick={handleAdd}>
            Adicionar
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : (
          <PaymentMethodList
            paymentMethods={paymentMethods}
            onEdit={handleEdit}
            onRemove={removePaymentMethod}
          />
        )}
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMethod ? 'Editar Meio de Pagamento' : 'Novo Meio de Pagamento'}
            </DialogTitle>
            <DialogDescription>
              {editingMethod
                ? 'Altere os dados do meio de pagamento.'
                : 'Preencha os dados do novo meio de pagamento.'}
            </DialogDescription>
          </DialogHeader>
          <PaymentMethodForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            editingMethod={editingMethod}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

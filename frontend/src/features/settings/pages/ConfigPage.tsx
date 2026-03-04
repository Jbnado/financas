import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog'
import { BillingCycleList } from '../components/BillingCycleList'
import { CategoryList } from '../components/CategoryList'
import { usePaymentMethods } from '../hooks/use-payment-methods'
import { PaymentMethodList } from '../components/PaymentMethodList'
import { PaymentMethodForm } from '../components/PaymentMethodForm'
import { PersonList } from '../components/PersonList'
import { FixedExpenseList } from '../components/FixedExpenseList'
import { TaxList } from '../components/TaxList'
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
      <h1 className="text-xl font-semibold">Configurações</h1>

      <BillingCycleList />

      <CategoryList />

      {isLoading ? (
        <Card>
          <CardHeader>
            <CardTitle>Meios de Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base">Meios de Pagamento</CardTitle>
            <Button size="sm" onClick={handleAdd} aria-label="Adicionar meio de pagamento">
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </CardHeader>
          <CardContent>
            <PaymentMethodList
              paymentMethods={paymentMethods}
              onEdit={handleEdit}
              onRemove={removePaymentMethod}
            />
          </CardContent>
        </Card>
      )}

      <PersonList />

      <FixedExpenseList />

      <TaxList />

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

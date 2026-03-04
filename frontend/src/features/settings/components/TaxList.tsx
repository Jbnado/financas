import { useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useTaxes } from '../hooks/use-taxes'
import { TaxFormDialog } from './TaxForm'
import { formatCurrency } from '@/shared/utils/currency'
import type { Tax } from '../types'

export function TaxList() {
  const { taxes, isLoading, removeTax, isRemoving } = useTaxes()
  const [editingTax, setEditingTax] = useState<Tax | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const handleDeactivate = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id)
      return
    }
    try {
      await removeTax(id)
      toast.success('Imposto desativado')
    } catch {
      toast.error('Erro ao desativar imposto')
    }
    setConfirmDeleteId(null)
  }

  const handleEdit = (tax: Tax) => {
    setEditingTax(tax)
    setShowForm(true)
  }

  const handleAdd = () => {
    setEditingTax(null)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingTax(null)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Impostos</CardTitle>
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
          <CardTitle className="text-base">Impostos</CardTitle>
          <Button size="sm" onClick={handleAdd} aria-label="Adicionar imposto">
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent>
          {!taxes?.length ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum imposto cadastrado
            </p>
          ) : (
            <ul className="space-y-2">
              {taxes.map((tax) => (
                <li
                  key={tax.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{tax.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(tax.estimatedAmount)} · {tax.rate}%
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Editar"
                      onClick={() => handleEdit(tax)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Desativar"
                      disabled={isRemoving}
                      onClick={() => handleDeactivate(tax.id)}
                    >
                      <Trash2
                        className={`h-4 w-4 ${confirmDeleteId === tax.id ? 'text-destructive' : ''}`}
                      />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <TaxFormDialog
        open={showForm}
        onClose={handleFormClose}
        tax={editingTax}
      />
    </>
  )
}

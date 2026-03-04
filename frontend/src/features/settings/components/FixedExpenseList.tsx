import { useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useFixedExpenses } from '../hooks/use-fixed-expenses'
import { FixedExpenseFormDialog } from './FixedExpenseForm'
import { formatCurrency } from '@/shared/utils/currency'
import type { FixedExpense } from '../types'

export function FixedExpenseList() {
  const { fixedExpenses, isLoading, removeFixedExpense, isRemoving } = useFixedExpenses()
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const handleDeactivate = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id)
      return
    }
    try {
      await removeFixedExpense(id)
      toast.success('Gasto fixo desativado')
    } catch {
      toast.error('Erro ao desativar gasto fixo')
    }
    setConfirmDeleteId(null)
  }

  const handleEdit = (expense: FixedExpense) => {
    setEditingExpense(expense)
    setShowForm(true)
  }

  const handleAdd = () => {
    setEditingExpense(null)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingExpense(null)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gastos Fixos</CardTitle>
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
          <CardTitle className="text-base">Gastos Fixos</CardTitle>
          <Button size="sm" onClick={handleAdd} aria-label="Adicionar gasto fixo">
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent>
          {!fixedExpenses?.length ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum gasto fixo cadastrado
            </p>
          ) : (
            <ul className="space-y-2">
              {fixedExpenses.map((expense) => (
                <li
                  key={expense.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{expense.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(expense.estimatedAmount)} · Dia {expense.dueDay}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Editar"
                      onClick={() => handleEdit(expense)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Desativar"
                      disabled={isRemoving}
                      onClick={() => handleDeactivate(expense.id)}
                    >
                      <Trash2
                        className={`h-4 w-4 ${confirmDeleteId === expense.id ? 'text-destructive' : ''}`}
                      />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <FixedExpenseFormDialog
        open={showForm}
        onClose={handleFormClose}
        expense={editingExpense}
      />
    </>
  )
}

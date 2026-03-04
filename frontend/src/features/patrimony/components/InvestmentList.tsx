import { useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Input } from '@/shared/components/ui/input'
import { useInvestments } from '../hooks/use-investments'
import { InvestmentFormDialog } from './InvestmentForm'
import type { Investment } from '../types'

const TYPE_LABELS: Record<string, string> = {
  fixed_income: 'RF',
  variable_income: 'RV',
  crypto: 'Cripto',
  real_estate: 'Imóvel',
  other: 'Outro',
}

function formatCurrency(value: string | number): string {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function InvestmentList() {
  const { investments, isLoading, deleteInvestment, updateValue, isDeleting } = useInvestments()
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [editingValueId, setEditingValueId] = useState<string | null>(null)
  const [valueInput, setValueInput] = useState('')

  const handleDelete = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id)
      return
    }
    try {
      await deleteInvestment(id)
      toast.success('Investimento removido')
    } catch {
      toast.error('Erro ao remover investimento')
    }
    setConfirmDeleteId(null)
  }

  const handleEdit = (inv: Investment) => {
    setEditingInvestment(inv)
    setShowForm(true)
  }

  const handleAdd = () => {
    setEditingInvestment(null)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingInvestment(null)
  }

  const handleValueClick = (inv: Investment) => {
    setEditingValueId(inv.id)
    setValueInput(String(Number(inv.currentValue)))
  }

  const handleValueSave = async (id: string) => {
    try {
      await updateValue({ id, currentValue: Number(valueInput) || 0 })
      toast.success('Valor atualizado')
    } catch {
      toast.error('Erro ao atualizar valor')
    }
    setEditingValueId(null)
  }

  const getRendimento = (inv: Investment) => {
    const diff = Number(inv.currentValue) - Number(inv.appliedAmount)
    return diff
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Investimentos</CardTitle>
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
          <CardTitle className="text-base">Investimentos</CardTitle>
          <Button size="sm" onClick={handleAdd} aria-label="Adicionar">
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent>
          {!investments?.length ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum investimento cadastrado
            </p>
          ) : (
            <ul className="space-y-2">
              {investments.map((inv) => {
                const rendimento = getRendimento(inv)
                return (
                  <li
                    key={inv.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                        {TYPE_LABELS[inv.type] ?? inv.type}
                      </span>
                      <div className="min-w-0">
                        <span className="text-sm font-medium block truncate">{inv.name}</span>
                        <span className="text-xs text-muted-foreground">{inv.institution}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        {editingValueId === inv.id ? (
                          <form
                            className="flex gap-1"
                            onSubmit={(e) => {
                              e.preventDefault()
                              handleValueSave(inv.id)
                            }}
                          >
                            <Input
                              type="number"
                              step="0.01"
                              value={valueInput}
                              onChange={(e) => setValueInput(e.target.value)}
                              className="w-28 h-8 text-sm"
                              autoFocus
                            />
                            <Button type="submit" size="sm" variant="ghost" className="h-8 px-2">
                              OK
                            </Button>
                          </form>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="text-sm font-semibold tabular-nums cursor-pointer hover:text-primary transition-colors block"
                              onClick={() => handleValueClick(inv)}
                              title="Clique para atualizar valor"
                            >
                              {formatCurrency(inv.currentValue)}
                            </button>
                            <span
                              className={`text-xs tabular-nums ${rendimento >= 0 ? 'text-green-600' : 'text-red-500'}`}
                            >
                              {rendimento >= 0 ? '+' : ''}{formatCurrency(rendimento)}
                            </span>
                          </>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Editar"
                        onClick={() => handleEdit(inv)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Excluir"
                        disabled={isDeleting}
                        onClick={() => handleDelete(inv.id)}
                      >
                        <Trash2
                          className={`h-4 w-4 ${confirmDeleteId === inv.id ? 'text-destructive' : ''}`}
                        />
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <InvestmentFormDialog
        open={showForm}
        onClose={handleFormClose}
        investment={editingInvestment}
      />
    </>
  )
}

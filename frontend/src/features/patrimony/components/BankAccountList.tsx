import { useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Input } from '@/shared/components/ui/input'
import { useBankAccounts } from '../hooks/use-bank-accounts'
import { BankAccountFormDialog } from './BankAccountForm'
import type { BankAccount } from '../types'

const TYPE_LABELS: Record<string, string> = {
  checking: 'CC',
  savings: 'Poup.',
  wallet: 'Digital',
}

function formatCurrency(value: string | number): string {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function BankAccountList() {
  const { bankAccounts, isLoading, deleteBankAccount, updateBalance, isDeleting } = useBankAccounts()
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [editingBalanceId, setEditingBalanceId] = useState<string | null>(null)
  const [balanceValue, setBalanceValue] = useState('')

  const handleDelete = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id)
      return
    }
    try {
      await deleteBankAccount(id)
      toast.success('Conta removida')
    } catch {
      toast.error('Erro ao remover conta')
    }
    setConfirmDeleteId(null)
  }

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account)
    setShowForm(true)
  }

  const handleAdd = () => {
    setEditingAccount(null)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingAccount(null)
  }

  const handleBalanceClick = (account: BankAccount) => {
    setEditingBalanceId(account.id)
    setBalanceValue(String(Number(account.balance)))
  }

  const handleBalanceSave = async (id: string) => {
    try {
      await updateBalance({ id, balance: Number(balanceValue) || 0 })
      toast.success('Saldo atualizado')
    } catch {
      toast.error('Erro ao atualizar saldo')
    }
    setEditingBalanceId(null)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contas Bancárias</CardTitle>
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
          <CardTitle className="text-base">Contas Bancárias</CardTitle>
          <Button size="sm" onClick={handleAdd} aria-label="Adicionar">
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent>
          {!bankAccounts?.length ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma conta bancária cadastrada
            </p>
          ) : (
            <ul className="space-y-2">
              {bankAccounts.map((account) => (
                <li
                  key={account.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                      {TYPE_LABELS[account.type] ?? account.type}
                    </span>
                    <div className="min-w-0">
                      <span className="text-sm font-medium block truncate">{account.name}</span>
                      <span className="text-xs text-muted-foreground">{account.institution}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingBalanceId === account.id ? (
                      <form
                        className="flex gap-1"
                        onSubmit={(e) => {
                          e.preventDefault()
                          handleBalanceSave(account.id)
                        }}
                      >
                        <Input
                          type="number"
                          step="0.01"
                          value={balanceValue}
                          onChange={(e) => setBalanceValue(e.target.value)}
                          className="w-28 h-8 text-sm"
                          autoFocus
                        />
                        <Button type="submit" size="sm" variant="ghost" className="h-8 px-2">
                          OK
                        </Button>
                      </form>
                    ) : (
                      <button
                        type="button"
                        className="text-sm font-semibold tabular-nums cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleBalanceClick(account)}
                        title="Clique para atualizar saldo"
                      >
                        {formatCurrency(account.balance)}
                      </button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Editar"
                      onClick={() => handleEdit(account)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Excluir"
                      disabled={isDeleting}
                      onClick={() => handleDelete(account.id)}
                    >
                      <Trash2
                        className={`h-4 w-4 ${confirmDeleteId === account.id ? 'text-destructive' : ''}`}
                      />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <BankAccountFormDialog
        open={showForm}
        onClose={handleFormClose}
        account={editingAccount}
      />
    </>
  )
}

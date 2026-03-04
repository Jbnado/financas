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
import { useBankAccounts } from '../hooks/use-bank-accounts'
import type { BankAccount, BankAccountType } from '../types'

interface BankAccountFormValues {
  name: string
  institution: string
  type: BankAccountType
  balance: string
}

interface BankAccountFormDialogProps {
  open: boolean
  onClose: () => void
  account: BankAccount | null
}

const TYPE_OPTIONS: { value: BankAccountType; label: string }[] = [
  { value: 'checking', label: 'Conta Corrente' },
  { value: 'savings', label: 'Poupança' },
  { value: 'wallet', label: 'Carteira Digital' },
]

export function BankAccountFormDialog({ open, onClose, account }: BankAccountFormDialogProps) {
  const { createBankAccount, updateBankAccount, isCreating, isUpdating } = useBankAccounts()
  const isEditing = !!account

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BankAccountFormValues>({
    defaultValues: {
      name: '',
      institution: '',
      type: 'checking',
      balance: '0',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: account?.name ?? '',
        institution: account?.institution ?? '',
        type: account?.type ?? 'checking',
        balance: account ? String(Number(account.balance)) : '0',
      })
    }
  }, [open, account, reset])

  const onSubmit = async (data: BankAccountFormValues) => {
    try {
      if (isEditing) {
        await updateBankAccount({
          id: account.id,
          data: {
            name: data.name,
            institution: data.institution,
            type: data.type,
          },
        })
        toast.success('Conta atualizada')
      } else {
        await createBankAccount({
          name: data.name,
          institution: data.institution,
          type: data.type,
          balance: Number(data.balance) || 0,
        })
        toast.success('Conta criada')
      }
      onClose()
    } catch {
      toast.error(isEditing ? 'Erro ao atualizar conta' : 'Erro ao criar conta')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Conta' : 'Nova Conta Bancária'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Altere os dados da conta' : 'Preencha os dados da nova conta'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="account-name" className="text-sm font-medium">
              Nome
            </label>
            <Input
              id="account-name"
              {...register('name', { required: 'Nome é obrigatório' })}
              placeholder="Ex: Conta Principal"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="account-institution" className="text-sm font-medium">
              Instituição
            </label>
            <Input
              id="account-institution"
              {...register('institution', { required: 'Instituição é obrigatória' })}
              placeholder="Ex: Nubank"
            />
            {errors.institution && (
              <p className="text-sm text-destructive">{errors.institution.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="account-type" className="text-sm font-medium">
              Tipo
            </label>
            <select
              id="account-type"
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

          {!isEditing && (
            <div className="space-y-2">
              <label htmlFor="account-balance" className="text-sm font-medium">
                Saldo Inicial
              </label>
              <Input
                id="account-balance"
                type="number"
                step="0.01"
                {...register('balance')}
                placeholder="0,00"
              />
            </div>
          )}

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

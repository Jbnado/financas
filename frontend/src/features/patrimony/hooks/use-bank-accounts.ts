import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/shared/services/api.service'
import type { BankAccount, CreateBankAccountInput, UpdateBankAccountInput } from '../types'

const BANK_ACCOUNTS_KEY = ['bank-accounts']

export function useBankAccounts() {
  const queryClient = useQueryClient()

  const { data: bankAccounts, isLoading } = useQuery({
    queryKey: BANK_ACCOUNTS_KEY,
    queryFn: () => apiService.get<BankAccount[]>('/bank-accounts'),
  })

  const createMutation = useMutation({
    mutationFn: (input: CreateBankAccountInput) =>
      apiService.post<BankAccount>('/bank-accounts', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANK_ACCOUNTS_KEY })
      queryClient.invalidateQueries({ queryKey: ['patrimony'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBankAccountInput }) =>
      apiService.put<BankAccount>(`/bank-accounts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANK_ACCOUNTS_KEY })
      queryClient.invalidateQueries({ queryKey: ['patrimony'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiService.delete<BankAccount>(`/bank-accounts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANK_ACCOUNTS_KEY })
      queryClient.invalidateQueries({ queryKey: ['patrimony'] })
    },
  })

  const updateBalanceMutation = useMutation({
    mutationFn: ({ id, balance }: { id: string; balance: number }) =>
      apiService.patch<BankAccount>(`/bank-accounts/${id}/balance`, { balance }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANK_ACCOUNTS_KEY })
      queryClient.invalidateQueries({ queryKey: ['patrimony'] })
    },
  })

  return {
    bankAccounts,
    isLoading,
    createBankAccount: createMutation.mutateAsync,
    updateBankAccount: updateMutation.mutateAsync,
    deleteBankAccount: deleteMutation.mutateAsync,
    updateBalance: updateBalanceMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

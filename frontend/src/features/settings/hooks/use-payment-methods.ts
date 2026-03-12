import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiService } from '@/shared/services/api.service'
import type { PaymentMethod, CreatePaymentMethodData, UpdatePaymentMethodData } from '../types'

const QUERY_KEY = ['payment-methods']

export function usePaymentMethods() {
  const queryClient = useQueryClient()

  const { data: paymentMethods, isLoading } = useQuery<PaymentMethod[]>({
    queryKey: QUERY_KEY,
    queryFn: () => apiService.get<PaymentMethod[]>('/payment-methods'),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreatePaymentMethodData) =>
      apiService.post<PaymentMethod>('/payment-methods', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Meio de pagamento criado')
    },
    onError: () => toast.error('Erro ao criar meio de pagamento'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePaymentMethodData }) =>
      apiService.put<PaymentMethod>(`/payment-methods/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Meio de pagamento atualizado')
    },
    onError: () => toast.error('Erro ao atualizar meio de pagamento'),
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) =>
      apiService.delete<PaymentMethod>(`/payment-methods/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Meio de pagamento removido')
    },
    onError: () => toast.error('Erro ao remover meio de pagamento'),
  })

  return {
    paymentMethods: paymentMethods ?? [],
    isLoading,
    createPaymentMethod: createMutation.mutateAsync,
    updatePaymentMethod: updateMutation.mutateAsync,
    removePaymentMethod: removeMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
  }
}

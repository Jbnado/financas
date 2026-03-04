import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiService } from '@/shared/services/api.service'
import type { Receivable, ReceivableSummary, CreatePaymentInput, SplitInput } from '../types'

export const RECEIVABLES_KEY = ['receivables'] as const

export function useReceivables(cycleId?: string) {
  const queryClient = useQueryClient()
  const qs = cycleId ? `?billingCycleId=${cycleId}` : ''

  const { data: summary, isLoading: isSummaryLoading } = useQuery<ReceivableSummary[]>({
    queryKey: [...RECEIVABLES_KEY, 'summary', cycleId],
    queryFn: () => apiService.get<ReceivableSummary[]>(`/receivables/summary${qs}`),
  })

  function usePersonReceivables(personId: string | undefined) {
    return useQuery<Receivable[]>({
      queryKey: [...RECEIVABLES_KEY, 'person', personId, cycleId],
      queryFn: () => apiService.get<Receivable[]>(`/persons/${personId}/receivables${qs}`),
      enabled: !!personId,
    })
  }

  const paymentMutation = useMutation({
    mutationFn: ({ receivableId, data }: { receivableId: string; data: CreatePaymentInput }) =>
      apiService.post(`/receivables/${receivableId}/payments`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECEIVABLES_KEY })
      toast.success('Pagamento registrado')
    },
    onError: () => toast.error('Erro ao registrar pagamento'),
  })

  const createSplitsMutation = useMutation({
    mutationFn: ({ transactionId, splits }: { transactionId: string; splits: SplitInput[] }) =>
      apiService.post(`/transactions/${transactionId}/splits`, { splits }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECEIVABLES_KEY })
    },
    onError: () => toast.error('Erro ao criar splits'),
  })

  return {
    summary: summary ?? [],
    isSummaryLoading,
    usePersonReceivables,
    createPayment: paymentMutation.mutateAsync,
    isCreatingPayment: paymentMutation.isPending,
    createSplits: createSplitsMutation.mutateAsync,
    isCreatingSplits: createSplitsMutation.isPending,
  }
}

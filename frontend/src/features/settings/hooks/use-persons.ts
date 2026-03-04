import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/shared/services/api.service'
import type { Person, CreatePersonInput, UpdatePersonInput } from '../types'

const QUERY_KEY = ['persons']

export function usePersons() {
  const queryClient = useQueryClient()

  const { data: persons, isLoading } = useQuery<Person[]>({
    queryKey: QUERY_KEY,
    queryFn: () => apiService.get<Person[]>('/persons'),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreatePersonInput) =>
      apiService.post<Person>('/persons', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePersonInput }) =>
      apiService.put<Person>(`/persons/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) =>
      apiService.delete<Person>(`/persons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  return {
    persons: persons ?? [],
    isLoading,
    createPerson: createMutation.mutateAsync,
    updatePerson: updateMutation.mutateAsync,
    removePerson: removeMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
  }
}

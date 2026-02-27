import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/shared/services/api.service'
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../types'

const CATEGORIES_KEY = ['categories']

export function useCategories() {
  const queryClient = useQueryClient()

  const { data: categories, isLoading } = useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: () => apiService.get<Category[]>('/api/categories'),
  })

  const createMutation = useMutation({
    mutationFn: (input: CreateCategoryInput) =>
      apiService.post<Category>('/api/categories', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryInput }) =>
      apiService.put<Category>(`/api/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiService.delete<Category>(`/api/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY })
    },
  })

  return {
    categories,
    isLoading,
    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

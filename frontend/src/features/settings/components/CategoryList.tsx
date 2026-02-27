import { useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useCategories } from '../hooks/use-categories'
import { CategoryFormDialog } from './CategoryForm'
import type { Category } from '../types'

export function CategoryList() {
  const { categories, isLoading, deleteCategory, isDeleting } = useCategories()
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const handleDeactivate = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id)
      return
    }
    try {
      await deleteCategory(id)
      toast.success('Categoria desativada')
    } catch {
      toast.error('Erro ao desativar categoria')
    }
    setConfirmDeleteId(null)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setShowForm(true)
  }

  const handleAdd = () => {
    setEditingCategory(null)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingCategory(null)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Categorias</CardTitle>
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
          <CardTitle className="text-base">Categorias</CardTitle>
          <Button size="sm" onClick={handleAdd} aria-label="Adicionar">
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent>
          {!categories?.length ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma categoria encontrada
            </p>
          ) : (
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      data-testid="category-color"
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: cat.color ?? '#6b7280' }}
                    />
                    <span className="text-sm font-medium">{cat.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Editar"
                      onClick={() => handleEdit(cat)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Desativar"
                      disabled={isDeleting}
                      onClick={() => handleDeactivate(cat.id)}
                    >
                      <Trash2
                        className={`h-4 w-4 ${confirmDeleteId === cat.id ? 'text-destructive' : ''}`}
                      />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <CategoryFormDialog
        open={showForm}
        onClose={handleFormClose}
        category={editingCategory}
      />
    </>
  )
}

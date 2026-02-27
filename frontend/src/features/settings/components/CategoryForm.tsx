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
import { useCategories } from '../hooks/use-categories'
import type { Category } from '../types'

interface CategoryFormValues {
  name: string
  icon: string
  color: string
}

interface CategoryFormDialogProps {
  open: boolean
  onClose: () => void
  category: Category | null
}

const DEFAULT_COLOR = '#6b7280'

export function CategoryFormDialog({ open, onClose, category }: CategoryFormDialogProps) {
  const { createCategory, updateCategory, isCreating, isUpdating } = useCategories()
  const isEditing = !!category

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    defaultValues: {
      name: '',
      icon: '',
      color: DEFAULT_COLOR,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: category?.name ?? '',
        icon: category?.icon ?? '',
        color: category?.color ?? DEFAULT_COLOR,
      })
    }
  }, [open, category, reset])

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      if (isEditing) {
        await updateCategory({
          id: category.id,
          data: {
            name: data.name,
            icon: data.icon || undefined,
            color: data.color || undefined,
          },
        })
        toast.success('Categoria atualizada')
      } else {
        await createCategory({
          name: data.name,
          icon: data.icon || undefined,
          color: data.color || undefined,
        })
        toast.success('Categoria criada')
      }
      onClose()
    } catch {
      toast.error(isEditing ? 'Erro ao atualizar categoria' : 'Erro ao criar categoria')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Altere os dados da categoria' : 'Preencha os dados da nova categoria'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="category-name" className="text-sm font-medium">
              Nome
            </label>
            <Input
              id="category-name"
              {...register('name', { required: 'Nome é obrigatório' })}
              placeholder="Ex: Alimentação"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="category-icon" className="text-sm font-medium">
              Ícone
            </label>
            <Input
              id="category-icon"
              {...register('icon')}
              placeholder="Ex: utensils"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="category-color" className="text-sm font-medium">
              Cor
            </label>
            <div className="flex gap-2">
              <Input
                id="category-color"
                type="color"
                className="w-12 h-10 p-1 cursor-pointer"
                {...register('color')}
              />
              <span className="flex-1 flex items-center text-sm text-muted-foreground px-3">
                {watch('color') || DEFAULT_COLOR}
              </span>
            </div>
          </div>

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

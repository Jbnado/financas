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
import { usePersons } from '../hooks/use-persons'
import type { Person } from '../types'

interface PersonFormValues {
  name: string
}

interface PersonFormDialogProps {
  open: boolean
  onClose: () => void
  person: Person | null
}

export function PersonFormDialog({ open, onClose, person }: PersonFormDialogProps) {
  const { createPerson, updatePerson, isCreating, isUpdating } = usePersons()
  const isEditing = !!person

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PersonFormValues>({
    defaultValues: {
      name: '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: person?.name ?? '',
      })
    }
  }, [open, person, reset])

  const onSubmit = async (data: PersonFormValues) => {
    try {
      if (isEditing) {
        await updatePerson({
          id: person.id,
          data: { name: data.name },
        })
        toast.success('Pessoa atualizada')
      } else {
        await createPerson({ name: data.name })
        toast.success('Pessoa criada')
      }
      onClose()
    } catch {
      toast.error(isEditing ? 'Erro ao atualizar pessoa' : 'Erro ao criar pessoa')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Pessoa' : 'Nova Pessoa'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Altere os dados da pessoa' : 'Preencha os dados da nova pessoa'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="person-name" className="text-sm font-medium">
              Nome
            </label>
            <Input
              id="person-name"
              {...register('name', { required: 'Nome é obrigatório' })}
              placeholder="Ex: Fulano"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
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

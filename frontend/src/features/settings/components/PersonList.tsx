import { useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { usePersons } from '../hooks/use-persons'
import { PersonFormDialog } from './PersonForm'
import type { Person } from '../types'

export function PersonList() {
  const { persons, isLoading, removePerson, isRemoving } = usePersons()
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const handleDeactivate = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id)
      return
    }
    try {
      await removePerson(id)
      toast.success('Pessoa desativada')
    } catch {
      toast.error('Erro ao desativar pessoa')
    }
    setConfirmDeleteId(null)
  }

  const handleEdit = (person: Person) => {
    setEditingPerson(person)
    setShowForm(true)
  }

  const handleAdd = () => {
    setEditingPerson(null)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingPerson(null)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pessoas</CardTitle>
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
          <CardTitle className="text-base">Pessoas</CardTitle>
          <Button size="sm" onClick={handleAdd} aria-label="Adicionar">
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent>
          {!persons?.length ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma pessoa encontrada
            </p>
          ) : (
            <ul className="space-y-2">
              {persons.map((person) => (
                <li
                  key={person.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <span className="text-sm font-medium">{person.name}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Editar"
                      onClick={() => handleEdit(person)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Desativar"
                      disabled={isRemoving}
                      onClick={() => handleDeactivate(person.id)}
                    >
                      <Trash2
                        className={`h-4 w-4 ${confirmDeleteId === person.id ? 'text-destructive' : ''}`}
                      />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <PersonFormDialog
        open={showForm}
        onClose={handleFormClose}
        person={editingPerson}
      />
    </>
  )
}

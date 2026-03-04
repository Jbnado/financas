import { useState } from 'react'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/shared/components/ui/command'
import { usePersons } from '@/features/settings/hooks/use-persons'
import { cn } from '@/shared/utils/cn'

interface PersonComboboxProps {
  value: string
  onChange: (personId: string) => void
  placeholder?: string
  className?: string
  'aria-label'?: string
}

export function PersonCombobox({
  value,
  onChange,
  placeholder = 'Selecione...',
  className,
  'aria-label': ariaLabel = 'Selecione pessoa',
}: PersonComboboxProps) {
  const { persons, createPerson } = usePersons()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)

  const selectedPerson = persons.find((p) => p.id === value)

  const filtered = persons.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  )

  const hasExactMatch = persons.some(
    (p) => p.name.toLowerCase() === search.toLowerCase(),
  )

  async function handleCreate() {
    if (!search.trim() || creating) return
    setCreating(true)
    try {
      const newPerson = await createPerson({ name: search.trim() })
      onChange(newPerson.id)
      setSearch('')
      setOpen(false)
    } finally {
      setCreating(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-xl border border-border bg-input px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            !selectedPerson && 'text-muted-foreground',
            className,
          )}
        >
          <span className="truncate">{selectedPerson?.name ?? placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar pessoa..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty className="py-3 text-center text-sm text-muted-foreground">
              Nenhuma pessoa encontrada.
            </CommandEmpty>
            <CommandGroup>
              {filtered.map((person) => (
                <CommandItem
                  key={person.id}
                  value={person.id}
                  onSelect={() => {
                    onChange(person.id === value ? '' : person.id)
                    setSearch('')
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === person.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {person.name}
                </CommandItem>
              ))}
              {search.trim() && !hasExactMatch && (
                <CommandItem onSelect={handleCreate} disabled={creating}>
                  <Plus className="mr-2 h-4 w-4" />
                  {creating ? 'Criando...' : `Criar "${search.trim()}"`}
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useCategories } from '@/features/settings/hooks/use-categories'
import { usePaymentMethods } from '@/features/settings/hooks/use-payment-methods'
import { usePersons } from '@/features/settings/hooks/use-persons'
import type { TransactionFilters as TFilters } from '../types'

interface TransactionFiltersProps {
  filters: TFilters
  onChange: (filters: TFilters) => void
}

export function TransactionFilters({ filters, onChange }: TransactionFiltersProps) {
  const { categories } = useCategories()
  const { paymentMethods } = usePaymentMethods()
  const { persons } = usePersons()

  const [searchInput, setSearchInput] = useState(filters.search ?? '')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim() || undefined
      if (trimmed !== filters.search) {
        onChange({ ...filters, search: trimmed })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-wrap gap-2">
      <div className="relative flex-1 min-w-[160px]">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar transação..."
          className="w-full rounded-md border border-border bg-background pl-8 pr-3 py-1.5 text-sm placeholder:text-muted-foreground"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Buscar por descrição"
        />
      </div>

      <select
        className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
        value={filters.categoryId ?? ''}
        onChange={(e) =>
          onChange({ ...filters, categoryId: e.target.value || undefined })
        }
        aria-label="Filtrar por categoria"
      >
        <option value="">Todas categorias</option>
        {(categories ?? []).map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <select
        className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
        value={filters.paymentMethodId ?? ''}
        onChange={(e) =>
          onChange({ ...filters, paymentMethodId: e.target.value || undefined })
        }
        aria-label="Filtrar por meio de pagamento"
      >
        <option value="">Todos meios</option>
        {paymentMethods.map((pm) => (
          <option key={pm.id} value={pm.id}>
            {pm.name}
          </option>
        ))}
      </select>

      <select
        className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
        value={filters.personId ?? ''}
        onChange={(e) =>
          onChange({ ...filters, personId: e.target.value || undefined })
        }
        aria-label="Filtrar por pessoa"
      >
        <option value="">Todas pessoas</option>
        {persons.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <select
        className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
        value={filters.isPaid === undefined ? '' : String(filters.isPaid)}
        onChange={(e) => {
          const val = e.target.value
          onChange({
            ...filters,
            isPaid: val === '' ? undefined : val === 'true',
          })
        }}
        aria-label="Filtrar por status de pagamento"
      >
        <option value="">Todos</option>
        <option value="true">Pagos</option>
        <option value="false">Não pagos</option>
      </select>
    </div>
  )
}

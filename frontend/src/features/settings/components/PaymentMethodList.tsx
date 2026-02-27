import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import type { PaymentMethod } from '../types'

interface PaymentMethodListProps {
  paymentMethods: PaymentMethod[]
  onEdit: (method: PaymentMethod) => void
  onRemove: (id: string) => void
}

export function PaymentMethodList({ paymentMethods, onEdit, onRemove }: PaymentMethodListProps) {
  if (paymentMethods.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        Nenhum meio de pagamento cadastrado.
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {paymentMethods.map((method) => (
        <li
          key={method.id}
          className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
        >
          <div className="flex items-center gap-3">
            <span className="font-medium">{method.name}</span>
            <Badge
              variant={method.type === 'credit' ? 'default' : 'secondary'}
              className={
                method.type === 'credit'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }
            >
              {method.type === 'credit' ? 'Crédito' : 'Débito'}
            </Badge>
            {method.dueDay != null && (
              <span className="text-sm text-muted-foreground">Dia {method.dueDay}</span>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(method)}
              aria-label="Editar"
            >
              Editar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(method.id)}
              aria-label="Desativar"
              className="text-destructive hover:text-destructive"
            >
              Desativar
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}

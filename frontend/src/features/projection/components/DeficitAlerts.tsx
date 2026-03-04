import { AlertTriangle, CheckCircle } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { formatCurrency } from '@/shared/utils/currency'
import type { Alert } from '../types'

interface DeficitAlertsProps {
  alerts: Alert[]
  isLoading?: boolean
}

export function DeficitAlerts({ alerts, isLoading }: DeficitAlertsProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground mb-3">Alertas</h2>
      {alerts.length === 0 ? (
        <div className="flex items-center gap-2 rounded-xl p-3" style={{ backgroundColor: '#0f172a' }}>
          <CheckCircle className="h-4 w-4 text-green-400" />
          <p className="text-sm text-green-400">Nenhum alerta — projeção positiva</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.month}
              className="flex items-center justify-between rounded-xl p-3"
              style={{ backgroundColor: '#0f172a' }}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-sm text-muted-foreground">{alert.month}</span>
              </div>
              <span className="text-sm font-medium text-red-400">
                {formatCurrency(alert.deficit)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

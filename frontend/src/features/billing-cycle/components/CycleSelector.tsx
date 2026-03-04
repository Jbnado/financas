import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { Skeleton } from '@/shared/components/ui/skeleton'

function formatCycleDate(isoDate: string): string {
  const date = new Date(isoDate)
  const day = date.getUTCDate()
  const month = new Intl.DateTimeFormat('pt-BR', {
    month: 'short',
    timeZone: 'UTC',
  }).format(date)
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1).replace('.', '')
  return `${day}/${capitalizedMonth}`
}

interface CycleSelectorProps {
  startDate: string
  endDate: string
  cycleName?: string
  cycleStatus?: 'open' | 'closed'
  isFirst: boolean
  isLast: boolean
  isLoading: boolean
  onPrev: () => void
  onNext: () => void
  onEdit?: () => void
  onNew?: () => void
}

export function CycleSelector({
  startDate,
  endDate,
  cycleName,
  cycleStatus,
  isFirst,
  isLast,
  isLoading,
  onPrev,
  onNext,
  onEdit,
  onNew,
}: CycleSelectorProps) {
  const hasPopover = !!(onEdit || onNew)
  const dateLabel = isLoading ? null : `${formatCycleDate(startDate)} — ${formatCycleDate(endDate)}`

  const badgeContent = isLoading ? (
    <Skeleton className="h-5 w-32" data-testid="cycle-selector-skeleton" />
  ) : (
    <span className="text-sm font-medium text-foreground">{dateLabel}</span>
  )

  const badge = (
    <div
      className={`flex items-center justify-center rounded-[20px] border px-4 py-2 ${hasPopover && !isLoading ? 'cursor-pointer hover:border-primary/50 transition-colors' : ''}`}
      style={{
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        minWidth: '180px',
      }}
    >
      {badgeContent}
    </div>
  )

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrev}
        disabled={isFirst || isLoading}
        aria-label="Ciclo anterior"
        className="h-10 w-10 shrink-0"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      {hasPopover && !isLoading ? (
        <Popover>
          <PopoverTrigger asChild>{badge}</PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-3">
              {cycleName && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{cycleName}</span>
                  {cycleStatus && (
                    <Badge variant={cycleStatus === 'open' ? 'default' : 'secondary'}>
                      {cycleStatus === 'open' ? 'Aberto' : 'Fechado'}
                    </Badge>
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground">{dateLabel}</p>
              <div className="flex gap-2">
                {onEdit && cycleStatus === 'open' && (
                  <Button size="sm" variant="outline" onClick={onEdit}>
                    Editar
                  </Button>
                )}
                {onNew && (
                  <Button size="sm" onClick={onNew}>
                    Novo ciclo
                  </Button>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        badge
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={isLast || isLoading}
        aria-label="Próximo ciclo"
        className="h-10 w-10 shrink-0"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  )
}

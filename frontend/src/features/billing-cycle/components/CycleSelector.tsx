import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
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
  isFirst: boolean
  isLast: boolean
  isLoading: boolean
  onPrev: () => void
  onNext: () => void
}

export function CycleSelector({
  startDate,
  endDate,
  isFirst,
  isLast,
  isLoading,
  onPrev,
  onNext,
}: CycleSelectorProps) {
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

      <div
        className="flex items-center justify-center rounded-[20px] border px-4 py-2"
        style={{
          backgroundColor: '#1e293b',
          borderColor: '#334155',
          minWidth: '180px',
        }}
      >
        {isLoading ? (
          <Skeleton className="h-5 w-32" data-testid="cycle-selector-skeleton" />
        ) : (
          <span className="text-sm font-medium text-foreground">
            {formatCycleDate(startDate)} — {formatCycleDate(endDate)}
          </span>
        )}
      </div>

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

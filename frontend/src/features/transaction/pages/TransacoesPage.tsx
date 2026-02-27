import { CycleSelector } from '@/features/billing-cycle/components/CycleSelector'
import { useBillingCycles } from '@/features/billing-cycle/hooks/use-billing-cycles'
import { useCycleNavigation } from '@/features/billing-cycle/hooks/use-cycle-navigation'
import { useCycleStore } from '@/features/billing-cycle/stores/cycle.store'

export default function TransacoesPage() {
  const { data: cycles = [], isLoading } = useBillingCycles()
  const setSelectedCycleId = useCycleStore((s) => s.setSelectedCycleId)

  const {
    currentCycle,
    isFirst,
    isLast,
    goNext,
    goPrev,
  } = useCycleNavigation(cycles)

  if (currentCycle) {
    setSelectedCycleId(currentCycle.id)
  }

  return (
    <div className="flex flex-1 flex-col p-4">
      {cycles.length > 0 && (
        <div className="mb-6">
          <CycleSelector
            startDate={currentCycle?.startDate ?? ''}
            endDate={currentCycle?.endDate ?? ''}
            isFirst={isFirst}
            isLast={isLast}
            isLoading={isLoading}
            onPrev={goPrev}
            onNext={goNext}
          />
        </div>
      )}
      <div className="flex flex-1 items-center justify-center">
        <p className="text-lg text-muted-foreground">Transações — Em breve</p>
      </div>
    </div>
  )
}

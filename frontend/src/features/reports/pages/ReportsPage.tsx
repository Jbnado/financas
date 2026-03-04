import { CycleSelector } from '@/features/billing-cycle/components/CycleSelector'
import { useBillingCycles } from '@/features/billing-cycle/hooks/use-billing-cycles'
import { useCycleNavigation } from '@/features/billing-cycle/hooks/use-cycle-navigation'
import { CategoryPieChart } from '../components/CategoryPieChart'
import { CycleEvolutionChart } from '../components/CycleEvolutionChart'
import { CycleComparisonCard } from '../components/CycleComparisonCard'
import { useCategoryDistribution, useCycleEvolution, useCycleComparison } from '../hooks/use-reports'

export default function ReportsPage() {
  const { data: cycles = [], isLoading: cyclesLoading } = useBillingCycles()
  const { currentCycle, isFirst, isLast, goNext, goPrev } = useCycleNavigation(cycles)

  const { data: distribution, isLoading: distLoading } = useCategoryDistribution(currentCycle?.id)
  const { data: evolution, isLoading: evoLoading } = useCycleEvolution(6)
  const { data: comparison, isLoading: compLoading } = useCycleComparison(currentCycle?.id)

  if (!cyclesLoading && cycles.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <p className="text-lg text-muted-foreground">Nenhum ciclo encontrado</p>
        <p className="text-sm text-muted-foreground">Crie ciclos no Dashboard para ver relatórios</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col p-4">
      <div className="mb-6 flex items-center justify-center">
        <CycleSelector
          startDate={currentCycle?.startDate ?? ''}
          endDate={currentCycle?.endDate ?? ''}
          cycleName={currentCycle?.name}
          cycleStatus={currentCycle?.status}
          isFirst={isFirst}
          isLast={isLast}
          isLoading={cyclesLoading}
          onPrev={goPrev}
          onNext={goNext}
        />
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl p-4" style={{ backgroundColor: '#1e293b' }}>
          <CategoryPieChart
            items={distribution?.items ?? []}
            isLoading={distLoading}
          />
        </div>

        <div className="rounded-2xl p-4" style={{ backgroundColor: '#1e293b' }}>
          <CycleEvolutionChart
            cycles={evolution?.cycles ?? []}
            isLoading={evoLoading}
          />
        </div>

        <div className="rounded-2xl p-4" style={{ backgroundColor: '#1e293b' }}>
          <CycleComparisonCard
            data={comparison}
            isLoading={compLoading}
          />
        </div>
      </div>
    </div>
  )
}

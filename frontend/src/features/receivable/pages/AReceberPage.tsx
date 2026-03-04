import { useState, useEffect } from 'react'
import { HandCoins } from 'lucide-react'
import { CycleSelector } from '@/features/billing-cycle/components/CycleSelector'
import { useBillingCycles } from '@/features/billing-cycle/hooks/use-billing-cycles'
import { useCycleNavigation } from '@/features/billing-cycle/hooks/use-cycle-navigation'
import { useReceivables } from '@/features/split/hooks/use-receivables'
import { PersonBalanceCard } from '@/features/split/components/PersonBalanceCard'
import { ReceivablesList } from '@/features/split/components/ReceivablesList'

interface SelectedPerson {
  personId: string
  personName: string
  totalPending: string
}

export default function AReceberPage() {
  const { data: cycles = [] } = useBillingCycles()
  const { currentCycle, isFirst, isLast, goNext, goPrev } = useCycleNavigation(cycles)
  const { summary, isSummaryLoading } = useReceivables(currentCycle?.id)
  const [selected, setSelected] = useState<SelectedPerson | null>(null)

  // Reset selected person when cycle changes
  useEffect(() => {
    setSelected(null)
  }, [currentCycle?.id])

  if (selected) {
    return (
      <div className="p-4">
        <ReceivablesList
          personId={selected.personId}
          personName={selected.personName}
          totalPending={selected.totalPending}
          onBack={() => setSelected(null)}
          cycleId={currentCycle?.id}
        />
      </div>
    )
  }

  const withPending = summary.filter((s) => parseFloat(s.totalPending) > 0)
  const withoutPending = summary.filter((s) => parseFloat(s.totalPending) <= 0)

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-semibold">A Receber</h1>

      {currentCycle && (
        <CycleSelector
          startDate={currentCycle.startDate}
          endDate={currentCycle.endDate}
          isFirst={isFirst}
          isLast={isLast}
          isLoading={false}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}

      {isSummaryLoading && (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      )}

      {!isSummaryLoading && summary.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <HandCoins className="h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">Nenhum valor a receber</p>
          <p className="text-xs text-muted-foreground">
            Divida um gasto para ver aqui
          </p>
        </div>
      )}

      {withPending.length > 0 && (
        <div className="space-y-2">
          {withPending.map((s) => (
            <PersonBalanceCard
              key={s.personId}
              personName={s.personName}
              totalPending={s.totalPending}
              onClick={() =>
                setSelected({
                  personId: s.personId,
                  personName: s.personName,
                  totalPending: s.totalPending,
                })
              }
            />
          ))}
        </div>
      )}

      {withoutPending.length > 0 && (
        <div className="space-y-2 opacity-60">
          {withoutPending.map((s) => (
            <PersonBalanceCard
              key={s.personId}
              personName={s.personName}
              totalPending={s.totalPending}
              onClick={() =>
                setSelected({
                  personId: s.personId,
                  personName: s.personName,
                  totalPending: s.totalPending,
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}

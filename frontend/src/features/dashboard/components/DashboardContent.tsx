import { useBillingCycle } from '@/features/billing-cycle/hooks/use-billing-cycles'
import { FinancialHeroCard } from './FinancialHeroCard'
import { StatsRow } from './StatsRow'
import { CategoryBreakdown } from './CategoryBreakdown'
import { RecentTransactions } from './RecentTransactions'

interface DashboardContentProps {
  cycleId: string | undefined
}

export function DashboardContent({ cycleId }: DashboardContentProps) {
  const { data: detail, isLoading } = useBillingCycle(cycleId)

  const summary = detail?.summary
  const totalExpenses = summary?.totalExpenses ?? '0.00'

  return (
    <div className="space-y-4">
      <FinancialHeroCard
        netResult={summary?.netResult ?? '0.00'}
        salary={summary?.salary ?? '0.00'}
        totalExpenses={totalExpenses}
        isLoading={isLoading}
      />

      <StatsRow
        salary={summary?.salary ?? '0.00'}
        totalExpenses={totalExpenses}
        totalReceivables={summary?.totalReceivables ?? '0.00'}
        isLoading={isLoading}
      />

      <CategoryBreakdown
        items={detail?.categoryBreakdown ?? []}
        isLoading={isLoading}
      />

      <RecentTransactions
        transactions={detail?.recentTransactions ?? []}
        isLoading={isLoading}
      />
    </div>
  )
}

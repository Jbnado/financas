import { Skeleton } from '@/shared/components/ui/skeleton'
import { formatCurrency } from '@/shared/utils/currency'

interface FinancialHeroCardProps {
  netResult: string
  salary: string
  totalExpenses: string
  isLoading?: boolean
}

export function FinancialHeroCard({ netResult, salary, totalExpenses, isLoading }: FinancialHeroCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl p-5" style={{ backgroundColor: '#1e293b' }}>
        <Skeleton className="mx-auto mb-2 h-4 w-24" />
        <Skeleton className="mx-auto mb-4 h-11 w-48" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    )
  }

  const net = parseFloat(netResult)
  const isPositive = net >= 0
  const salaryNum = parseFloat(salary) || 1
  const expensesNum = parseFloat(totalExpenses) || 0
  const ratio = Math.min(expensesNum / salaryNum, 1)

  return (
    <div className="rounded-2xl p-5 text-center" style={{ backgroundColor: '#1e293b' }}>
      <p className="text-xs text-muted-foreground mb-1">Resultado líquido</p>
      <p
        className="text-[44px] font-bold leading-tight tracking-tight"
        style={{ color: isPositive ? '#6ee7a0' : '#fca5a5' }}
      >
        {isPositive ? '+' : ''}{formatCurrency(netResult)}
      </p>
      <div className="mt-4 h-2 w-full rounded-full bg-muted/30 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${ratio * 100}%`,
            backgroundColor: ratio > 0.9 ? '#fca5a5' : ratio > 0.7 ? '#fcd34d' : '#6ee7a0',
          }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        <span>Despesas: {formatCurrency(totalExpenses)}</span>
        <span>Receita: {formatCurrency(salary)}</span>
      </div>
    </div>
  )
}

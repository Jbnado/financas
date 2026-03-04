import { Skeleton } from '@/shared/components/ui/skeleton'
import { formatCurrency } from '@/shared/utils/currency'

interface StatsRowProps {
  salary: string
  totalExpenses: string
  totalReceivables: string
  isLoading?: boolean
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex-1 rounded-[14px] p-3 text-center" style={{ backgroundColor: '#1e293b' }}>
      <p className="text-[18px] font-bold" style={{ color }}>{formatCurrency(value)}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}

export function StatsRow({ salary, totalExpenses, totalReceivables, isLoading }: StatsRowProps) {
  if (isLoading) {
    return (
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 rounded-[14px] p-3 text-center" style={{ backgroundColor: '#1e293b' }}>
            <Skeleton className="mx-auto mb-1 h-5 w-16" />
            <Skeleton className="mx-auto h-3 w-12" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <StatCard label="Receita" value={salary} color="#6ee7a0" />
      <StatCard label="Despesa" value={totalExpenses} color="#fca5a5" />
      <StatCard label="A Receber" value={totalReceivables} color="#fcd34d" />
    </div>
  )
}

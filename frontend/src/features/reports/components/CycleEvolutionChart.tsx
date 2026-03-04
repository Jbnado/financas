import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { formatCurrency } from '@/shared/utils/currency'
import type { CycleEvolutionEntry } from '../types'

interface CycleEvolutionChartProps {
  cycles: CycleEvolutionEntry[]
  isLoading?: boolean
}

function shortName(name: string): string {
  // "Ciclo Janeiro/2026" → "Jan"
  const parts = name.replace('Ciclo ', '').split('/')
  return parts[0]?.substring(0, 3) ?? name
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: CycleEvolutionEntry }> }) {
  if (!active || !payload?.[0]) return null
  const entry = payload[0].payload
  const net = parseFloat(entry.netResult)
  return (
    <div className="rounded-lg border border-border bg-popover p-2 text-sm shadow-md">
      <p className="font-medium">{entry.cycleName}</p>
      <p className="text-muted-foreground">Receita: {formatCurrency(entry.salary)}</p>
      <p className="text-muted-foreground">Despesas: {formatCurrency(entry.totalExpenses)}</p>
      <p style={{ color: net >= 0 ? '#6ee7a0' : '#fca5a5' }}>
        Resultado: {net >= 0 ? '+' : ''}{formatCurrency(entry.netResult)}
      </p>
    </div>
  )
}

export function CycleEvolutionChart({ cycles, isLoading }: CycleEvolutionChartProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    )
  }

  if (cycles.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">Sem dados de evolução</p>
      </div>
    )
  }

  const data = cycles.map((c) => ({
    ...c,
    netResultNum: parseFloat(c.netResult),
    label: shortName(c.cycleName),
  }))

  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground mb-3">Evolução do resultado líquido</h2>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6ee7a0" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6ee7a0" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="netResultNum"
            stroke="#6ee7a0"
            fill="url(#netGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

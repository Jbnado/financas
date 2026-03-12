import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { formatCurrency } from '@/shared/utils/currency'
import type { ProjectionEntry } from '../types'

interface ProjectionChartProps {
  projections: ProjectionEntry[]
  isLoading?: boolean
}

function shortName(name: string): string {
  const parts = name.split(' ')
  const month = parts[0]?.substring(0, 3) ?? name
  const year = parts[1]?.slice(-2) ?? ''
  return year ? `${month}/${year}` : month
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ProjectionEntry & { netNum: number } }> }) {
  if (!active || !payload?.[0]) return null
  const entry = payload[0].payload
  const net = entry.netNum
  return (
    <div className="rounded-lg border border-border bg-popover p-2 text-sm shadow-md">
      <p className="font-medium">{entry.cycleName}</p>
      <p className="text-muted-foreground">Salário: {formatCurrency(entry.projectedSalary)}</p>
      <p className="text-muted-foreground">Gastos Fixos: {formatCurrency(entry.projectedFixedExpenses)}</p>
      <p className="text-muted-foreground">Impostos: {formatCurrency(entry.projectedTaxes)}</p>
      <p className="text-muted-foreground">Parcelas: {formatCurrency(entry.projectedInstallments)}</p>
      <p style={{ color: net >= 0 ? '#6ee7a0' : '#fca5a5' }}>
        Resultado: {net >= 0 ? '+' : ''}{formatCurrency(entry.projectedNetResult)}
      </p>
    </div>
  )
}

export function ProjectionChart({ projections, isLoading }: ProjectionChartProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    )
  }

  if (projections.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">Sem dados para projeção</p>
      </div>
    )
  }

  const data = projections.map((p) => ({
    ...p,
    label: shortName(p.cycleName),
    salary: parseFloat(p.projectedSalary),
    expenses: parseFloat(p.projectedFixedExpenses) + parseFloat(p.projectedTaxes) + parseFloat(p.projectedInstallments),
    netNum: parseFloat(p.projectedNetResult),
  }))

  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground mb-3">Projeção de Receita vs Despesas</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value: string) => value === 'salary' ? 'Salário' : 'Despesas'}
            wrapperStyle={{ fontSize: 12, color: '#94a3b8' }}
          />
          <Bar dataKey="salary" name="salary" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill="#6ee7a0" />
            ))}
          </Bar>
          <Bar dataKey="expenses" name="expenses" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.netNum < 0 ? '#fca5a5' : '#94a3b8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import type { PatrimonyDistribution } from '../types'

interface PatrimonyDistributionChartProps {
  distribution: PatrimonyDistribution | undefined
  isLoading: boolean
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
]

function formatCurrency(value: string | number): string {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function PatrimonyDistributionChart({ distribution, isLoading }: PatrimonyDistributionChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribuição</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!distribution?.items.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribuição</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum dado disponível
          </p>
        </CardContent>
      </Card>
    )
  }

  const data = distribution.items.map((item) => ({
    name: item.label,
    value: Number(item.total),
    percentage: item.percentage,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Distribuição</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
              nameKey="name"
              label={({ name, percentage }) => `${name} ${percentage.toFixed(0)}%`}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

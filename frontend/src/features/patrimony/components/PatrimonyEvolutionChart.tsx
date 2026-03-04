import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import type { PatrimonyEvolution } from '../types'

interface PatrimonyEvolutionChartProps {
  evolution: PatrimonyEvolution | undefined
  isLoading: boolean
}

function formatCurrency(value: string | number): string {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function PatrimonyEvolutionChart({ evolution, isLoading }: PatrimonyEvolutionChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evolução</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!evolution?.snapshots.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evolução</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum dado disponível
          </p>
        </CardContent>
      </Card>
    )
  }

  const data = evolution.snapshots.map((snap) => ({
    name: snap.cycleName,
    totalAssets: Number(snap.totalAssets),
    netPatrimony: Number(snap.netPatrimony),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Evolução</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name === 'totalAssets' ? 'Patrimônio Total' : 'Patrimônio Líquido',
              ]}
            />
            <Legend
              formatter={(value: string) =>
                value === 'totalAssets' ? 'Patrimônio Total' : 'Patrimônio Líquido'
              }
            />
            <Area
              type="monotone"
              dataKey="totalAssets"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.15}
            />
            <Area
              type="monotone"
              dataKey="netPatrimony"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.15}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

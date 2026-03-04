import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { formatCurrency } from '@/shared/utils/currency'
import type { CategoryDistributionItem } from '../types'

interface CategoryPieChartProps {
  items: CategoryDistributionItem[]
  isLoading?: boolean
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: CategoryDistributionItem }> }) {
  if (!active || !payload?.[0]) return null
  const item = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-popover p-2 text-sm shadow-md">
      <p className="font-medium">{item.categoryName}</p>
      <p className="text-muted-foreground">
        {formatCurrency(item.total)} ({item.percentage}%)
      </p>
    </div>
  )
}

export function CategoryPieChart({ items, isLoading }: CategoryPieChartProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="mx-auto h-48 w-48 rounded-full" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">Sem dados de categoria neste ciclo</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground mb-3">Distribuição por categoria</h2>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={items}
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={40}
            dataKey="percentage"
            nameKey="categoryName"
            stroke="none"
          >
            {items.map((item) => (
              <Cell key={item.categoryId} fill={item.categoryColor ?? '#6b7280'} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3 justify-center mt-2">
        {items.map((item) => (
          <div key={item.categoryId} className="flex items-center gap-1.5 text-xs">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.categoryColor ?? '#6b7280' }}
            />
            <span>{item.categoryName}</span>
            <span className="text-muted-foreground">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

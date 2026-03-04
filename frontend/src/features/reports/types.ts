export interface CategoryDistributionItem {
  categoryId: string
  categoryName: string
  categoryColor: string | null
  total: string
  percentage: number
}

export interface CategoryDistribution {
  items: CategoryDistributionItem[]
  grandTotal: string
}

export interface CycleEvolutionEntry {
  cycleId: string
  cycleName: string
  salary: string
  totalExpenses: string
  netResult: string
}

export interface CycleEvolution {
  cycles: CycleEvolutionEntry[]
}

export interface CycleSummary {
  cycleName: string
  salary: string
  totalExpenses: string
  netResult: string
  categories: {
    categoryName: string
    categoryColor: string | null
    total: string
  }[]
}

export interface CycleComparison {
  current: CycleSummary
  previous: CycleSummary | null
  diff: {
    expensesDiff: string
    netResultDiff: string
  } | null
}

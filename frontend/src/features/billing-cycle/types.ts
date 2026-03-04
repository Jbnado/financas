export interface BillingCycleSummary {
  salary: string
  totalCards: string
  totalFixed: string
  totalTaxes: string
  totalExpenses: string
  totalReceivables: string
  netResult: string
}

export interface BillingCycle {
  id: string
  name: string
  startDate: string
  endDate: string
  salary: string
  status: 'open' | 'closed'
  closedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CategoryBreakdownItem {
  categoryId: string
  categoryName: string
  categoryColor: string | null
  total: string
}

export interface RecentTransaction {
  id: string
  description: string
  amount: string
  userAmount: string
  date: string
  isPaid: boolean
  category: { id: string; name: string; color: string | null }
  paymentMethod: { id: string; name: string }
}

export interface BillingCycleDetail extends BillingCycle {
  summary: BillingCycleSummary
  categoryBreakdown: CategoryBreakdownItem[]
  recentTransactions: RecentTransaction[]
}

export interface CreateBillingCycleDto {
  name: string
  startDate: string
  endDate: string
  salary: string
}

export interface UpdateBillingCycleDto {
  name?: string
  startDate?: string
  endDate?: string
  salary?: string
}

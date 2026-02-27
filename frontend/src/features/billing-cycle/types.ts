export interface BillingCycleSummary {
  salary: string
  totalCards: string
  totalFixed: string
  totalTaxes: string
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
  createdAt: string
  updatedAt: string
}

export interface BillingCycleDetail extends BillingCycle {
  summary: BillingCycleSummary
}

export interface CreateBillingCycleDto {
  name: string
  startDate: string
  endDate: string
  salary: string
}

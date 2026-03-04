export type BankAccountType = 'checking' | 'savings' | 'wallet'
export type InvestmentType = 'fixed_income' | 'variable_income' | 'crypto' | 'real_estate' | 'other'
export type LiquidityType = 'daily' | 'monthly' | 'at_maturity'

export interface BankAccount {
  id: string
  name: string
  institution: string
  type: BankAccountType
  balance: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateBankAccountInput {
  name: string
  institution: string
  type: BankAccountType
  balance?: number
}

export interface UpdateBankAccountInput {
  name?: string
  institution?: string
  type?: BankAccountType
}

export interface Investment {
  id: string
  name: string
  type: InvestmentType
  institution: string
  appliedAmount: string
  currentValue: string
  liquidity: LiquidityType
  maturityDate: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateInvestmentInput {
  name: string
  type: InvestmentType
  institution: string
  appliedAmount: number
  currentValue: number
  liquidity: LiquidityType
  maturityDate?: string
}

export interface UpdateInvestmentInput {
  name?: string
  type?: InvestmentType
  institution?: string
  liquidity?: LiquidityType
  maturityDate?: string | null
}

export interface PatrimonySummary {
  totalBankAccounts: string
  totalInvestments: string
  totalAssets: string
  futureInstallments: string
  netPatrimony: string
}

export interface DistributionItem {
  type: string
  label: string
  total: string
  percentage: number
}

export interface PatrimonyDistribution {
  items: DistributionItem[]
  grandTotal: string
}

export interface EvolutionSnapshot {
  cycleName: string
  snapshotDate: string
  totalAssets: string
  netPatrimony: string
}

export interface PatrimonyEvolution {
  snapshots: EvolutionSnapshot[]
}

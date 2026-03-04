export interface Category {
  id: string
  name: string
  icon: string | null
  color: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryInput {
  name: string
  icon?: string
  color?: string
}

export interface UpdateCategoryInput {
  name?: string
  icon?: string
  color?: string
}

export interface PaymentMethod {
  id: string
  name: string
  type: 'credit' | 'debit'
  dueDay: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreatePaymentMethodData {
  name: string
  type: 'credit' | 'debit'
  dueDay?: number
}

export interface UpdatePaymentMethodData {
  name?: string
  type?: 'credit' | 'debit'
  dueDay?: number | null
}

export interface Person {
  id: string
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreatePersonInput {
  name: string
}

export interface UpdatePersonInput {
  name?: string
}

export interface FixedExpense {
  id: string
  name: string
  estimatedAmount: string
  dueDay: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateFixedExpenseInput {
  name: string
  estimatedAmount: string
  dueDay: number
}

export interface UpdateFixedExpenseInput {
  name?: string
  estimatedAmount?: string
  dueDay?: number
}

export interface FixedExpenseEntry {
  id: string
  fixedExpenseId: string
  billingCycleId: string
  actualAmount: string
  isPaid: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateFixedExpenseEntryInput {
  billingCycleId: string
  actualAmount: string
  isPaid?: boolean
}

export interface Tax {
  id: string
  name: string
  rate: string
  estimatedAmount: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTaxInput {
  name: string
  rate: string
  estimatedAmount: string
}

export interface UpdateTaxInput {
  name?: string
  rate?: string
  estimatedAmount?: string
}

export interface TaxEntry {
  id: string
  taxId: string
  billingCycleId: string
  actualAmount: string
  isPaid: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTaxEntryInput {
  billingCycleId: string
  actualAmount: string
  isPaid?: boolean
}

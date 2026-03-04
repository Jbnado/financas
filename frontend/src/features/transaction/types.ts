export interface Transaction {
  id: string
  description: string
  amount: string
  date: string
  isPaid: boolean
  installmentNumber: number | null
  totalInstallments: number | null
  userId: string
  billingCycleId: string
  categoryId: string
  paymentMethodId: string
  parentTransactionId: string | null
  createdAt: string
  updatedAt: string
  category: {
    id: string
    name: string
    icon: string | null
    color: string | null
  }
  paymentMethod: {
    id: string
    name: string
    type: 'credit' | 'debit'
  }
  splits?: TransactionSplit[]
}

export interface CreateTransactionInput {
  id?: string
  description: string
  amount: string
  date: string
  billingCycleId: string
  categoryId: string
  paymentMethodId: string
  totalInstallments?: number
}

export interface UpdateTransactionInput {
  description?: string
  amount?: string
  date?: string
  categoryId?: string
  paymentMethodId?: string
}

export interface TransactionSplit {
  id: string
  personId: string
  amount: string
  person: { id: string; name: string }
}

export interface TransactionDetail extends Transaction {
  splits: TransactionSplit[]
  userAmount: string
}

export interface TransactionFilters {
  categoryId?: string
  paymentMethodId?: string
  isPaid?: boolean
  personId?: string
  search?: string
}

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
  dueDay?: number
}

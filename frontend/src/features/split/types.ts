export interface Receivable {
  id: string
  splitId: string
  personId: string
  amount: string
  paidAmount: string
  status: 'pending' | 'partial' | 'paid'
  createdAt: string
  updatedAt: string
  split: {
    transaction: {
      id: string
      description: string
      date: string
      amount: string
    }
  }
  payments: ReceivablePayment[]
}

export interface ReceivablePayment {
  id: string
  receivableId: string
  amount: string
  paidAt: string
  createdAt: string
}

export interface ReceivableSummary {
  personId: string
  personName: string
  totalPending: string
  totalPaid: string
}

export interface SplitInput {
  personId: string
  amount: string
}

export interface CreatePaymentInput {
  amount: string
  paidAt: string
}

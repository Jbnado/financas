import { create } from 'zustand'
import type { Transaction } from '../types'

interface TransactionFormStore {
  isOpen: boolean
  editingTransaction: Transaction | null
  openCreate: () => void
  openEdit: (tx: Transaction) => void
  close: () => void
}

export const useTransactionFormStore = create<TransactionFormStore>((set) => ({
  isOpen: false,
  editingTransaction: null,
  openCreate: () => set({ isOpen: true, editingTransaction: null }),
  openEdit: (tx) => set({ isOpen: true, editingTransaction: tx }),
  close: () => set({ isOpen: false, editingTransaction: null }),
}))

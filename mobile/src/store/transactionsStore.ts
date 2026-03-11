import { create } from 'zustand';
import type { Transaction } from '@types/domain.types';

interface TransactionsState {
  /** childId → liste de transactions */
  transactionsByChild: Record<string, Transaction[]>;
  /** childId → solde calculé */
  balanceByChild: Record<string, number>;
  isLoading: boolean;
  error: string | null;

  setTransactions: (childId: string, transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  setBalance: (childId: string, balance: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTransactionsStore = create<TransactionsState>((set) => ({
  transactionsByChild: {},
  balanceByChild: {},
  isLoading: false,
  error: null,

  setTransactions: (childId, transactions) =>
    set((state) => ({
      transactionsByChild: {
        ...state.transactionsByChild,
        [childId]: transactions,
      },
    })),

  addTransaction: (transaction) =>
    set((state) => {
      const existing =
        state.transactionsByChild[transaction.childId] ?? [];
      return {
        transactionsByChild: {
          ...state.transactionsByChild,
          [transaction.childId]: [transaction, ...existing],
        },
      };
    }),

  setBalance: (childId, balance) =>
    set((state) => ({
      balanceByChild: { ...state.balanceByChild, [childId]: balance },
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

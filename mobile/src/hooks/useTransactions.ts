import { useEffect, useCallback } from 'react';
import { transactionsService } from '@services/transactions.service';
import { useTransactionsStore } from '@store/transactionsStore';

export function useChildBalance(childId: string) {
  const { balanceByChild, setBalance, setLoading, setError } =
    useTransactionsStore();

  const balance = balanceByChild[childId] ?? 0;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await transactionsService.getBalance(childId);
    setLoading(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    setBalance(childId, result.data ?? 0);
  }, [childId, setBalance, setLoading, setError]);

  useEffect(() => {
    load();
  }, [load]);

  return { balance, refresh: load };
}

export function useTransactions(childId: string) {
  const { transactionsByChild, setTransactions, isLoading, error, setLoading, setError } =
    useTransactionsStore();

  const transactions = transactionsByChild[childId] ?? [];

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await transactionsService.getTransactions(childId);
    setLoading(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    setTransactions(childId, result.data ?? []);
  }, [childId, setTransactions, setLoading, setError]);

  useEffect(() => {
    load();
  }, [load]);

  return { transactions, isLoading, error, refresh: load };
}

import { supabase } from '@config/supabase';
import { safeCall } from '@utils/safeCall';
import type { Transaction, TransactionType, ServiceResult } from '@/types/domain.types';

function dbRowToTransaction(row: Record<string, unknown>): Transaction {
  return {
    id: row.id as string,
    childId: row.child_id as string,
    type: row.type as TransactionType,
    amount: row.amount as number,
    description: row.description as string,
    referenceId: (row.reference_id as string) ?? null,
    createdAt: row.created_at as string,
    createdBy: (row.created_by as string) ?? null,
  };
}

export const transactionsService = {
  async getTransactions(
    childId: string,
    limit = 50
  ): Promise<ServiceResult<Transaction[]>> {
    return safeCall(async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw new Error(error.message);
      return (data ?? []).map(dbRowToTransaction);
    });
  },

  async getBalance(childId: string): Promise<ServiceResult<number>> {
    return safeCall(async () => {
      const { data, error } = await supabase
        .from('child_balances')
        .select('balance')
        .eq('child_id', childId)
        .single();

      if (error) throw new Error(error.message);
      return data?.balance ?? 0;
    });
  },

  /**
   * Ajout manuel (dépôt ou retrait).
   * Le type et le signe de amount sont fournis par l'appelant.
   */
  async createManualTransaction(data: {
    childId: string;
    type: 'manual_deposit' | 'manual_withdrawal';
    amount: number;
    description: string;
    createdBy: string;
  }): Promise<ServiceResult<Transaction>> {
    return safeCall(async () => {
      // Les retraits sont des montants négatifs
      const signedAmount =
        data.type === 'manual_withdrawal'
          ? -Math.abs(data.amount)
          : Math.abs(data.amount);

      const { data: tx, error } = await supabase
        .from('transactions')
        .insert({
          child_id: data.childId,
          type: data.type,
          amount: signedAmount,
          description: data.description,
          created_by: data.createdBy,
        })
        .select("*")
        .single();

      if (error || !tx) throw new Error(error?.message ?? 'Erreur transaction.');
      return dbRowToTransaction(tx);
    });
  },
};

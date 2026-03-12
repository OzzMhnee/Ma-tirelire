import type { AppError, ServiceResult } from '@/types/domain.types';

/**
 * Wrapper DRY pour tous les appels de service.
 * Uniformise le pattern try/catch et le format de retour.
 */
export async function safeCall<T>(
  fn: () => Promise<T>
): Promise<ServiceResult<T>> {
  try {
    const data = await fn();
    return { data };
  } catch (err: unknown) {
    const error: AppError =
      err instanceof Error
        ? { code: 'UNKNOWN_ERROR', message: err.message }
        : { code: 'UNKNOWN_ERROR', message: 'Une erreur inattendue est survenue.' };
    return { error };
  }
}

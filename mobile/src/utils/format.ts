import i18n from '@/i18n/config';

/**
 * Formate un montant en devise selon la locale active.
 * Exemple : formatCurrency(12.5) → "12,50 €" (fr) ou "€12.50" (en)
 */
export function formatCurrency(amount: number, currency = 'EUR'): string {
  const locale = i18n.language === 'en' ? 'en-GB' : 'fr-FR';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formate un montant signé avec le signe explicite (+/-).
 * Exemple : formatSignedCurrency(5) → "+5,00 €", formatSignedCurrency(-3) → "-3,00 €"
 */
export function formatSignedCurrency(amount: number, currency = 'EUR'): string {
  const prefix = amount > 0 ? '+' : '';
  return `${prefix}${formatCurrency(amount, currency)}`;
}

/**
 * Formate une date ISO selon la locale active.
 */
export function formatDate(isoDate: string): string {
  const locale = i18n.language === 'en' ? 'en-GB' : 'fr-FR';
  return new Date(isoDate).toLocaleDateString(locale);
}

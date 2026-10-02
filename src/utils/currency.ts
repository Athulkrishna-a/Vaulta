import type { CurrencyCode } from '../types';

const CURRENCY_LOCALES: Record<CurrencyCode, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
};

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode = 'INR',
  compact: boolean = false
): string {
  const locale = CURRENCY_LOCALES[currencyCode] || 'en-IN';
  
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
      notation: compact ? 'compact' : 'standard',
    });
    return formatter.format(amount);
  } catch (e) {
    const symbol = CURRENCY_SYMBOLS[currencyCode] || '₹';
    return `${symbol}${amount.toLocaleString()}`;
  }
}

export function getCurrencySymbol(currencyCode: CurrencyCode = 'INR'): string {
  return CURRENCY_SYMBOLS[currencyCode] || '₹';
}

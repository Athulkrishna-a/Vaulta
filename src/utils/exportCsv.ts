import type { Transaction, Category } from '../types';
import { formatTransactionDate } from './dateUtils';

export async function exportTransactionsToCsv(transactions: Transaction[], categories: Category[]) {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const headers = ['ID', 'Date', 'Type', 'Amount', 'Category', 'Account', 'Payment Method', 'Note', 'Merchant'];

  const rows = transactions.map((t) => [
    t.id,
    formatTransactionDate(t.date),
    t.type.toUpperCase(),
    t.amount,
    t.categoryId ? categoryMap.get(t.categoryId) || 'Uncategorized' : 'N/A',
    t.accountId || 'N/A',
    t.paymentMethod || 'N/A',
    `"${(t.note || '').replace(/"/g, '""')}"`,
    `"${(t.merchant || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const filename = `ExpenseTrack_Export_${new Date().toISOString().substring(0, 10)}.csv`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
    try {
      const file = new File([blob], filename, { type: 'text/csv' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'ExpenseTrack CSV Export',
          text: 'Transactions CSV Export File',
        });
        return;
      }
    } catch (e) {
      // Fallback
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 2000);
}

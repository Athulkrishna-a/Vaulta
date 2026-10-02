import type { Transaction, Category } from '../types';
import { formatTransactionDate } from './dateUtils';

export function exportTransactionsToCsv(transactions: Transaction[], categories: Category[]) {
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

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `ExpenseTrack_Export_${new Date().toISOString().substring(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

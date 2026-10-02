import type { BackupPayload } from '../types';
import { transactionRepository } from '../data/repositories/transactionRepository';
import { categoryRepository } from '../data/repositories/categoryRepository';
import { accountRepository } from '../data/repositories/accountRepository';
import { budgetRepository } from '../data/repositories/budgetRepository';
import { recurringRepository } from '../data/repositories/recurringRepository';
import { settingsRepository } from '../data/repositories/settingsRepository';

export async function createFullBackup(): Promise<BackupPayload> {
  const transactions = await transactionRepository.getAll();
  const categories = await categoryRepository.getAll();
  const accounts = await accountRepository.getAll();
  const settings = await settingsRepository.get();
  const recurring = await recurringRepository.getAll();
  const currentMonthKey = new Date().toISOString().substring(0, 7);
  const budget = await budgetRepository.getByMonth(currentMonthKey);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    transactions,
    categories,
    accounts,
    budgets: budget ? [budget] : [],
    recurring,
    settings,
  };
}

export function downloadJsonFile(data: object, filename: string) {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  summary?: {
    transactionCount: number;
    categoryCount: number;
    accountCount: number;
    budgetCount: number;
    exportedAt: string;
  };
}

export function validateBackupFile(payload: any): ValidationResult {
  const errors: string[] = [];

  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['Selected file is not a valid JSON object.'] };
  }

  if (payload.version !== 1) {
    errors.push(`Unsupported backup version: ${payload.version}. Expected version 1.`);
  }

  if (!Array.isArray(payload.transactions)) {
    errors.push('Missing or invalid "transactions" array in backup file.');
  } else {
    const invalidTx = payload.transactions.find(
      (t: any) => !t.id || typeof t.amount !== 'number' || isNaN(t.amount) || !t.type || !t.date
    );
    if (invalidTx) {
      errors.push('One or more transaction records contain invalid or missing fields (id, amount, type, date).');
    }
  }

  if (!Array.isArray(payload.categories)) {
    errors.push('Missing or invalid "categories" array in backup file.');
  }

  if (!Array.isArray(payload.accounts)) {
    errors.push('Missing or invalid "accounts" array in backup file.');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    summary: {
      transactionCount: payload.transactions.length,
      categoryCount: payload.categories.length,
      accountCount: payload.accounts.length,
      budgetCount: Array.isArray(payload.budgets) ? payload.budgets.length : 0,
      exportedAt: payload.exportedAt || 'Unknown date',
    },
  };
}

export async function restoreBackup(payload: BackupPayload): Promise<void> {
  await transactionRepository.clearAll();
  await categoryRepository.clearAll();
  await accountRepository.clearAll();
  await budgetRepository.clearAll();

  if (payload.categories && payload.categories.length > 0) {
    await categoryRepository.bulkInsert(payload.categories);
  }

  if (payload.accounts && payload.accounts.length > 0) {
    await accountRepository.bulkInsert(payload.accounts);
  }

  if (payload.transactions && payload.transactions.length > 0) {
    await transactionRepository.bulkInsert(payload.transactions);
  }

  if (payload.budgets && payload.budgets.length > 0) {
    await budgetRepository.bulkInsert(payload.budgets);
  }

  if (payload.settings) {
    await settingsRepository.update(payload.settings);
  }
}

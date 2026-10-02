import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Transaction, Category, Account, MonthlyBudget, RecurringTransaction, AppSettings } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_ACCOUNTS, DEFAULT_SETTINGS, INITIAL_SAMPLE_TRANSACTIONS, DEFAULT_BUDGET } from './seed/seedData';

interface ExpenseTrackerDB extends DBSchema {
  transactions: {
    key: string;
    value: Transaction;
    indexes: {
      'by-date': string;
      'by-type': string;
      'by-category': string;
      'by-account': string;
    };
  };
  categories: {
    key: string;
    value: Category;
    indexes: {
      'by-type': string;
    };
  };
  accounts: {
    key: string;
    value: Account;
  };
  budgets: {
    key: string;
    value: MonthlyBudget;
    indexes: {
      'by-month': string;
    };
  };
  recurring: {
    key: string;
    value: RecurringTransaction;
  };
  settings: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'ExpenseTrackerDB';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<ExpenseTrackerDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<ExpenseTrackerDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ExpenseTrackerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Transactions Store
        if (!db.objectStoreNames.contains('transactions')) {
          const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
          txStore.createIndex('by-date', 'date');
          txStore.createIndex('by-type', 'type');
          txStore.createIndex('by-category', 'categoryId');
          txStore.createIndex('by-account', 'accountId');
        }

        // Categories Store
        if (!db.objectStoreNames.contains('categories')) {
          const catStore = db.createObjectStore('categories', { keyPath: 'id' });
          catStore.createIndex('by-type', 'type');
        }

        // Accounts Store
        if (!db.objectStoreNames.contains('accounts')) {
          db.createObjectStore('accounts', { keyPath: 'id' });
        }

        // Budgets Store
        if (!db.objectStoreNames.contains('budgets')) {
          const budgetStore = db.createObjectStore('budgets', { keyPath: 'id' });
          budgetStore.createIndex('by-month', 'month');
        }

        // Recurring Store
        if (!db.objectStoreNames.contains('recurring')) {
          db.createObjectStore('recurring', { keyPath: 'id' });
        }

        // Settings Store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Initializes database with default seed data on first launch
 */
export async function initializeDatabaseIfEmpty(): Promise<void> {
  const db = await getDB();
  const txCount = await db.count('transactions');
  const catCount = await db.count('categories');
  const accCount = await db.count('accounts');

  if (catCount === 0) {
    const tx = db.transaction('categories', 'readwrite');
    for (const cat of DEFAULT_CATEGORIES) {
      await tx.store.put(cat);
    }
    await tx.done;
  }

  if (accCount === 0) {
    const tx = db.transaction('accounts', 'readwrite');
    for (const acc of DEFAULT_ACCOUNTS) {
      await tx.store.put(acc);
    }
    await tx.done;
  }

  if (txCount === 0) {
    const tx = db.transaction('transactions', 'readwrite');
    for (const sampleTx of INITIAL_SAMPLE_TRANSACTIONS) {
      await tx.store.put(sampleTx);
    }
    await tx.done;

    // Seed default budget
    await db.put('budgets', DEFAULT_BUDGET);
  }

  const settings = await db.get('settings', 'app_config');
  if (!settings) {
    await db.put('settings', DEFAULT_SETTINGS, 'app_config');
  }
}

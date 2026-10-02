import { getDB } from '../db';
import { Transaction, FilterOptions } from '../../types';

export const transactionRepository = {
  async getAll(): Promise<Transaction[]> {
    const db = await getDB();
    const list = await db.getAllFromIndex('transactions', 'by-date');
    return list.reverse(); // Newest first by default
  },

  async getById(id: string): Promise<Transaction | undefined> {
    const db = await getDB();
    return db.get('transactions', id);
  },

  async add(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const db = await getDB();
    const now = new Date().toISOString();
    const newTransaction: Transaction = {
      ...transaction,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: now,
      updatedAt: now,
    };
    await db.put('transactions', newTransaction);
    return newTransaction;
  },

  async update(transaction: Transaction): Promise<Transaction> {
    const db = await getDB();
    const updated: Transaction = {
      ...transaction,
      updatedAt: new Date().toISOString(),
    };
    await db.put('transactions', updated);
    return updated;
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('transactions', id);
  },

  async filter(options: FilterOptions): Promise<Transaction[]> {
    let all = await this.getAll();

    if (options.searchQuery.trim()) {
      const q = options.searchQuery.toLowerCase();
      all = all.filter(
        (t) =>
          (t.note && t.note.toLowerCase().includes(q)) ||
          (t.merchant && t.merchant.toLowerCase().includes(q)) ||
          t.amount.toString().includes(q)
      );
    }

    if (options.type && options.type !== 'all') {
      all = all.filter((t) => t.type === options.type);
    }

    if (options.categoryId && options.categoryId !== 'all') {
      all = all.filter((t) => t.categoryId === options.categoryId);
    }

    if (options.accountId && options.accountId !== 'all') {
      all = all.filter(
        (t) => t.accountId === options.accountId || t.destinationAccountId === options.accountId
      );
    }

    if (options.paymentMethod && options.paymentMethod !== 'all') {
      all = all.filter((t) => t.paymentMethod === options.paymentMethod);
    }

    if (options.startDate) {
      const start = new Date(options.startDate).getTime();
      all = all.filter((t) => new Date(t.date).getTime() >= start);
    }

    if (options.endDate) {
      const end = new Date(options.endDate).getTime();
      all = all.filter((t) => new Date(t.date).getTime() <= end);
    }

    // Sort
    all.sort((a, b) => {
      if (options.sortBy === 'date_desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (options.sortBy === 'date_asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (options.sortBy === 'amount_desc') {
        return b.amount - a.amount;
      }
      if (options.sortBy === 'amount_asc') {
        return a.amount - b.amount;
      }
      return 0;
    });

    return all;
  },

  async clearAll(): Promise<void> {
    const db = await getDB();
    await db.clear('transactions');
  },

  async bulkInsert(transactions: Transaction[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('transactions', 'readwrite');
    for (const t of transactions) {
      await tx.store.put(t);
    }
    await tx.done;
  }
};

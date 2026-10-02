import { getDB } from '../db';
import { Account } from '../../types';

export const accountRepository = {
  async getAll(): Promise<Account[]> {
    const db = await getDB();
    return db.getAll('accounts');
  },

  async getById(id: string): Promise<Account | undefined> {
    const db = await getDB();
    return db.get('accounts', id);
  },

  async add(account: Omit<Account, 'id' | 'createdAt'>): Promise<Account> {
    const db = await getDB();
    const newAccount: Account = {
      ...account,
      id: `acc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    await db.put('accounts', newAccount);
    return newAccount;
  },

  async update(account: Account): Promise<Account> {
    const db = await getDB();
    await db.put('accounts', account);
    return account;
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('accounts', id);
  },

  async clearAll(): Promise<void> {
    const db = await getDB();
    await db.clear('accounts');
  },

  async bulkInsert(accounts: Account[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('accounts', 'readwrite');
    for (const a of accounts) {
      await tx.store.put(a);
    }
    await tx.done;
  }
};

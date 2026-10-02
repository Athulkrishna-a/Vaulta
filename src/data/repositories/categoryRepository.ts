import { getDB } from '../db';
import { Category } from '../../types';

export const categoryRepository = {
  async getAll(): Promise<Category[]> {
    const db = await getDB();
    return db.getAll('categories');
  },

  async add(category: Omit<Category, 'id' | 'createdAt' | 'isDefault'>): Promise<Category> {
    const db = await getDB();
    const newCategory: Category = {
      ...category,
      id: `cat_custom_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };
    await db.put('categories', newCategory);
    return newCategory;
  },

  async update(category: Category): Promise<Category> {
    const db = await getDB();
    await db.put('categories', category);
    return category;
  },

  async countAssociatedTransactions(categoryId: string): Promise<number> {
    const db = await getDB();
    const txs = await db.getAllFromIndex('transactions', 'by-category', categoryId);
    return txs.length;
  },

  async delete(categoryId: string, reassignToCategoryId?: string): Promise<void> {
    const db = await getDB();
    
    if (reassignToCategoryId) {
      const txs = await db.getAllFromIndex('transactions', 'by-category', categoryId);
      const tx = db.transaction('transactions', 'readwrite');
      for (const t of txs) {
        t.categoryId = reassignToCategoryId;
        await tx.store.put(t);
      }
      await tx.done;
    }

    await db.delete('categories', categoryId);
  },

  async clearAll(): Promise<void> {
    const db = await getDB();
    await db.clear('categories');
  },

  async bulkInsert(categories: Category[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('categories', 'readwrite');
    for (const c of categories) {
      await tx.store.put(c);
    }
    await tx.done;
  }
};

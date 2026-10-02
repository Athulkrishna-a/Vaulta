import { getDB } from '../db';
import { MonthlyBudget } from '../../types';

export const budgetRepository = {
  async getByMonth(month: string): Promise<MonthlyBudget | undefined> {
    const db = await getDB();
    const budgets = await db.getAllFromIndex('budgets', 'by-month', month);
    return budgets.find((b) => !b.categoryId) || budgets[0];
  },

  async setBudget(month: string, amount: number): Promise<MonthlyBudget> {
    const db = await getDB();
    const existing = await this.getByMonth(month);
    const budget: MonthlyBudget = {
      id: existing ? existing.id : `budget_${month}`,
      month,
      amount,
    };
    await db.put('budgets', budget);
    return budget;
  },

  async clearAll(): Promise<void> {
    const db = await getDB();
    await db.clear('budgets');
  },

  async bulkInsert(budgets: MonthlyBudget[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('budgets', 'readwrite');
    for (const b of budgets) {
      await tx.store.put(b);
    }
    await tx.done;
  }
};

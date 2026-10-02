import { getDB } from '../db';
import { RecurringTransaction, Transaction } from '../../types';
import { transactionRepository } from './transactionRepository';

export const recurringRepository = {
  async getAll(): Promise<RecurringTransaction[]> {
    const db = await getDB();
    return db.getAll('recurring');
  },

  async add(recurring: Omit<RecurringTransaction, 'id'>): Promise<RecurringTransaction> {
    const db = await getDB();
    const newRec: RecurringTransaction = {
      ...recurring,
      id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    };
    await db.put('recurring', newRec);
    return newRec;
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('recurring', id);
  },

  /**
   * Processes all active recurring transactions and automatically generates due transactions
   * preventing any duplicate entries.
   */
  async processDueRecurring(): Promise<number> {
    const list = await this.getAll();
    const now = new Date();
    let generatedCount = 0;

    for (const rec of list) {
      const start = new Date(rec.startDate);
      if (start > now) continue;
      if (rec.endDate && new Date(rec.endDate) < now) continue;

      const lastDate = rec.lastProcessedDate ? new Date(rec.lastProcessedDate) : start;
      const nextDue = new Date(lastDate);

      if (rec.frequency === 'daily') {
        nextDue.setDate(nextDue.getDate() + 1);
      } else if (rec.frequency === 'weekly') {
        nextDue.setDate(nextDue.getDate() + 7);
      } else if (rec.frequency === 'monthly') {
        nextDue.setMonth(nextDue.getMonth() + 1);
      } else if (rec.frequency === 'yearly') {
        nextDue.setFullYear(nextDue.getFullYear() + 1);
      }

      if (nextDue <= now) {
        const txDate = nextDue.toISOString();
        
        // Prevent duplicate: check if transaction with this recurringId and date exists
        const allTx = await transactionRepository.getAll();
        const exists = allTx.some(
          (t) => t.recurringTransactionId === rec.id && t.date.substring(0, 10) === txDate.substring(0, 10)
        );

        if (!exists) {
          await transactionRepository.add({
            type: rec.type,
            amount: rec.amount,
            categoryId: rec.categoryId,
            accountId: rec.accountId,
            date: txDate,
            note: rec.note || `Recurring (${rec.frequency})`,
            paymentMethod: rec.paymentMethod || 'Other',
            recurringTransactionId: rec.id,
          });

          rec.lastProcessedDate = txDate;
          const db = await getDB();
          await db.put('recurring', rec);
          generatedCount++;
        }
      }
    }

    return generatedCount;
  }
};

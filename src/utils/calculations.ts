import type { Transaction, Category, Account, MonthlyBudget, MonthlySummary } from '../types';
import { getCurrentMonthKey } from './dateUtils';

export function calculateTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function calculateTotalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function calculateTotalInvestments(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'investment')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function calculateBalance(transactions: Transaction[], initialBalance: number = 0): number {
  const income = calculateTotalIncome(transactions);
  const expenses = calculateTotalExpenses(transactions);
  const investments = calculateTotalInvestments(transactions);
  return initialBalance + income - expenses - investments;
}

export function filterTransactionsByMonth(transactions: Transaction[], monthKey: string): Transaction[] {
  return transactions.filter((t) => {
    const txMonth = t.date.substring(0, 7);
    return txMonth === monthKey;
  });
}

export function calculateMonthlySummary(
  transactions: Transaction[],
  categories: Category[],
  monthKey: string = getCurrentMonthKey()
): MonthlySummary {
  const monthTx = filterTransactionsByMonth(transactions, monthKey);
  
  const totalIncome = calculateTotalIncome(monthTx);
  const totalExpense = calculateTotalExpenses(monthTx);
  const netBalance = totalIncome - totalExpense;

  const categoryMap = new Map<string, number>();
  monthTx
    .filter((t) => t.type === 'expense' && t.categoryId)
    .forEach((t) => {
      const current = categoryMap.get(t.categoryId!) || 0;
      categoryMap.set(t.categoryId!, current + t.amount);
    });

  const categoryExpenses = Array.from(categoryMap.entries()).map(([catId, amount]) => {
    const category = categories.find((c) => c.id === catId);
    return {
      categoryId: catId,
      categoryName: category ? category.name : 'Uncategorized',
      color: category ? category.color : '#9E9E9E',
      icon: category ? category.icon : 'Tag',
      amount,
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
    };
  }).sort((a, b) => b.amount - a.amount);

  return {
    month: monthKey,
    totalIncome,
    totalExpense,
    netBalance,
    categoryExpenses,
  };
}

export function calculateAccountBalances(
  accounts: Account[],
  transactions: Transaction[]
): Map<string, number> {
  const balances = new Map<string, number>();
  
  accounts.forEach((acc) => {
    balances.set(acc.id, acc.initialBalance || 0);
  });

  transactions.forEach((t) => {
    if (t.type === 'income' && t.accountId) {
      const current = balances.get(t.accountId) || 0;
      balances.set(t.accountId, current + t.amount);
    } else if (t.type === 'expense' && t.accountId) {
      const current = balances.get(t.accountId) || 0;
      balances.set(t.accountId, current - t.amount);
    } else if (t.type === 'transfer' && t.accountId && t.destinationAccountId) {
      const srcCurrent = balances.get(t.accountId) || 0;
      const destCurrent = balances.get(t.destinationAccountId) || 0;
      balances.set(t.accountId, srcCurrent - t.amount);
      balances.set(t.destinationAccountId, destCurrent + t.amount);
    }
  });

  return balances;
}

export function calculateBudgetUsage(
  monthlyExpense: number,
  budget?: MonthlyBudget
): { amount: number; percentage: number; isExceeded: boolean; diff: number } {
  if (!budget || budget.amount <= 0) {
    return { amount: 0, percentage: 0, isExceeded: false, diff: 0 };
  }
  const percentage = Math.min(Math.round((monthlyExpense / budget.amount) * 100), 999);
  const diff = monthlyExpense - budget.amount;
  return {
    amount: budget.amount,
    percentage,
    isExceeded: monthlyExpense > budget.amount,
    diff: Math.abs(diff),
  };
}

export function generateFinancialInsights(
  transactions: Transaction[],
  categories: Category[],
  budget?: MonthlyBudget
): string[] {
  const insights: string[] = [];
  const currentMonthKey = getCurrentMonthKey();
  
  const [year, month] = currentMonthKey.split('-').map(Number);
  const prevDate = new Date(year, month - 2, 1);
  const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  const currentSummary = calculateMonthlySummary(transactions, categories, currentMonthKey);
  const prevSummary = calculateMonthlySummary(transactions, categories, prevMonthKey);

  if (currentSummary.categoryExpenses.length > 0) {
    const topCat = currentSummary.categoryExpenses[0];
    const prevTopCat = prevSummary.categoryExpenses.find((c) => c.categoryId === topCat.categoryId);
    if (prevTopCat) {
      const diff = topCat.amount - prevTopCat.amount;
      if (diff > 0) {
        insights.push(`You spent ₹${diff.toLocaleString()} more on ${topCat.categoryName} this month than last month.`);
      } else if (diff < 0) {
        insights.push(`Great job! You spent ₹${Math.abs(diff).toLocaleString()} less on ${topCat.categoryName} compared to last month.`);
      }
    }
    insights.push(`${topCat.categoryName} accounts for ${topCat.percentage}% of your total spending this month.`);
  }

  if (budget && budget.amount > 0) {
    if (currentSummary.totalExpense > budget.amount) {
      const over = currentSummary.totalExpense - budget.amount;
      insights.push(`Your spending is currently ₹${over.toLocaleString()} above your monthly budget.`);
    } else {
      const under = budget.amount - currentSummary.totalExpense;
      insights.push(`Your spending is currently ₹${under.toLocaleString()} below your monthly budget.`);
    }
  }

  if (insights.length === 0) {
    insights.push('Track more transactions to receive automatic spending insights!');
  }

  return insights;
}

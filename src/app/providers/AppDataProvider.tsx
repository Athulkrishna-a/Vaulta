import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { Transaction, Category, Account, MonthlyBudget, AppSettings, FilterOptions } from '../../types';
import { initializeDatabaseIfEmpty } from '../../data/db';
import { transactionRepository } from '../../data/repositories/transactionRepository';
import { categoryRepository } from '../../data/repositories/categoryRepository';
import { accountRepository } from '../../data/repositories/accountRepository';
import { budgetRepository } from '../../data/repositories/budgetRepository';
import { settingsRepository } from '../../data/repositories/settingsRepository';
import { recurringRepository } from '../../data/repositories/recurringRepository';
import { getCurrentMonthKey } from '../../utils/dateUtils';
import { calculateBalance, calculateMonthlySummary, calculateTotalInvestments } from '../../utils/calculations';
import { DEFAULT_PAYMENT_METHODS, DEFAULT_INVESTMENT_TYPES } from '../../data/seed/seedData';

interface AppDataContextType {
  loading: boolean;
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  currentBudget?: MonthlyBudget;
  settings: AppSettings;
  activeMonth: string;
  setActiveMonth: (month: string) => void;

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Transaction>;
  updateTransaction: (tx: Transaction) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  
  addCategory: (cat: Omit<Category, 'id' | 'createdAt' | 'isDefault'>) => Promise<Category>;
  updateCategory: (cat: Category) => Promise<Category>;
  deleteCategory: (id: string, reassignToId?: string) => Promise<void>;
  reorderCategories: (newOrdered: Category[]) => Promise<void>;
  
  addAccount: (acc: Omit<Account, 'id' | 'createdAt'>) => Promise<Account>;
  updateAccount: (acc: Account) => Promise<Account>;
  reorderAccounts: (newOrdered: Account[]) => Promise<void>;
  
  updateBudget: (amount: number, month?: string) => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  updatePaymentMethods: (methods: string[]) => Promise<void>;
  updateInvestmentTypes: (types: string[]) => Promise<void>;

  filterTransactions: (options: FilterOptions) => Promise<Transaction[]>;
  reloadAll: () => Promise<void>;
  
  // Derived state memoized
  paymentMethods: string[];
  investmentTypes: string[];
  totalBalance: number;
  totalInvestments: number;
  monthlySummary: ReturnType<typeof calculateMonthlySummary>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentBudget, setCurrentBudget] = useState<MonthlyBudget | undefined>(undefined);
  const [settings, setSettings] = useState<AppSettings>(settingsRepository.get as any);
  const [activeMonth, setActiveMonth] = useState<string>(getCurrentMonthKey());

  const reloadAll = useCallback(async () => {
    try {
      await initializeDatabaseIfEmpty();
      
      // Auto-process due recurring transactions
      await recurringRepository.processDueRecurring();

      const [txList, catList, accList, appSettings, budget] = await Promise.all([
        transactionRepository.getAll(),
        categoryRepository.getAll(),
        accountRepository.getAll(),
        settingsRepository.get(),
        budgetRepository.getByMonth(activeMonth),
      ]);

      setTransactions(txList);
      setCategories(catList);
      setAccounts(accList);
      setSettings(appSettings);
      setCurrentBudget(budget);
    } catch (error) {
      console.error('Failed to load application data:', error);
    } finally {
      setLoading(false);
    }
  }, [activeMonth]);

  useEffect(() => {
    reloadAll();
  }, [reloadAll]);

  // Actions
  const addTransaction = async (txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTx = await transactionRepository.add(txData);
    setTransactions((prev) => [newTx, ...prev]);
    return newTx;
  };

  const updateTransaction = async (txData: Transaction) => {
    const updated = await transactionRepository.update(txData);
    setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    return updated;
  };

  const deleteTransaction = async (id: string) => {
    await transactionRepository.delete(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const addCategory = async (catData: Omit<Category, 'id' | 'createdAt' | 'isDefault'>) => {
    const newCat = await categoryRepository.add(catData);
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = async (catData: Category) => {
    const updated = await categoryRepository.update(catData);
    setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    return updated;
  };

  const deleteCategory = async (id: string, reassignToId?: string) => {
    await categoryRepository.delete(id, reassignToId);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    if (reassignToId) {
      const updatedTxs = await transactionRepository.getAll();
      setTransactions(updatedTxs);
    }
  };

  const reorderCategories = async (newOrdered: Category[]) => {
    setCategories(newOrdered);
    const db = await (await import('../../data/db')).getDB();
    const tx = db.transaction('categories', 'readwrite');
    for (const c of newOrdered) {
      await tx.store.put(c);
    }
    await tx.done;
  };

  const addAccount = async (accData: Omit<Account, 'id' | 'createdAt'>) => {
    const newAcc = await accountRepository.add(accData);
    setAccounts((prev) => [...prev, newAcc]);
    return newAcc;
  };

  const updateAccount = async (accData: Account) => {
    const updated = await accountRepository.update(accData);
    setAccounts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    return updated;
  };

  const reorderAccounts = async (newOrdered: Account[]) => {
    setAccounts(newOrdered);
    const db = await (await import('../../data/db')).getDB();
    const tx = db.transaction('accounts', 'readwrite');
    for (const a of newOrdered) {
      await tx.store.put(a);
    }
    await tx.done;
  };

  const updateBudget = async (amount: number, month: string = activeMonth) => {
    const b = await budgetRepository.setBudget(month, amount);
    setCurrentBudget(b);
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = await settingsRepository.update(newSettings);
    setSettings(updated);
  };

  const updatePaymentMethods = async (methods: string[]) => {
    await updateSettings({ customPaymentMethods: methods });
  };

  const updateInvestmentTypes = async (types: string[]) => {
    await updateSettings({ customInvestmentTypes: types });
  };

  const filterTransactions = async (options: FilterOptions) => {
    return transactionRepository.filter(options);
  };

  // Derived state
  const paymentMethods = useMemo(() => {
    return settings.customPaymentMethods && settings.customPaymentMethods.length > 0
      ? settings.customPaymentMethods
      : DEFAULT_PAYMENT_METHODS;
  }, [settings.customPaymentMethods]);

  const investmentTypes = useMemo(() => {
    return settings.customInvestmentTypes && settings.customInvestmentTypes.length > 0
      ? settings.customInvestmentTypes
      : DEFAULT_INVESTMENT_TYPES;
  }, [settings.customInvestmentTypes]);

  const totalBalance = useMemo(() => {
    const initialSum = accounts.reduce((acc, a) => acc + (a.initialBalance || 0), 0);
    return calculateBalance(transactions, initialSum);
  }, [transactions, accounts]);

  const totalInvestments = useMemo(() => {
    return calculateTotalInvestments(transactions);
  }, [transactions]);

  const monthlySummary = useMemo(() => {
    return calculateMonthlySummary(transactions, categories, activeMonth);
  }, [transactions, categories, activeMonth]);

  const value = useMemo(
    () => ({
      loading,
      transactions,
      categories,
      accounts,
      currentBudget,
      settings,
      activeMonth,
      setActiveMonth,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      updateCategory,
      deleteCategory,
      reorderCategories,
      addAccount,
      updateAccount,
      reorderAccounts,
      updateBudget,
      updateSettings,
      updatePaymentMethods,
      updateInvestmentTypes,
      filterTransactions,
      reloadAll,
      paymentMethods,
      investmentTypes,
      totalBalance,
      totalInvestments,
      monthlySummary,
    }),
    [
      loading,
      transactions,
      categories,
      accounts,
      currentBudget,
      settings,
      activeMonth,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      updateCategory,
      deleteCategory,
      reorderCategories,
      addAccount,
      updateAccount,
      reorderAccounts,
      updateBudget,
      updateSettings,
      updatePaymentMethods,
      updateInvestmentTypes,
      filterTransactions,
      reloadAll,
      paymentMethods,
      investmentTypes,
      totalBalance,
      totalInvestments,
      monthlySummary,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}

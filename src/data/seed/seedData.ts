import { Category, Account, Transaction, AppSettings, MonthlyBudget } from '../../types';

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense Categories
  { id: 'cat_food', name: 'Food', icon: 'Utensils', color: '#FF7675', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_groceries', name: 'Groceries', icon: 'ShoppingBag', color: '#00B894', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_transport', name: 'Transport', icon: 'Car', color: '#0984E3', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_fuel', name: 'Fuel', icon: 'Fuel', color: '#FDCB6E', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_bills', name: 'Bills', icon: 'FileText', color: '#6C5CE7', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_rent', name: 'Rent', icon: 'Home', color: '#E84393', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#00CEC9', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_entertainment', name: 'Entertainment', icon: 'Tv', color: '#FD79A8', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_health', name: 'Health', icon: 'HeartPulse', color: '#55EFC4', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_education', name: 'Education', icon: 'GraduationCap', color: '#FAB1A0', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_travel', name: 'Travel', icon: 'Plane', color: '#A29BFE', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_subscriptions', name: 'Subscriptions', icon: 'CreditCard', color: '#FF7675', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_personal', name: 'Personal Care', icon: 'Smile', color: '#00B894', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_emi', name: 'EMI', icon: 'Landmark', color: '#0984E3', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_other_exp', name: 'Other Expense', icon: 'MoreHorizontal', color: '#B2BABB', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },

  // Income Categories
  { id: 'cat_salary', name: 'Salary', icon: 'Briefcase', color: '#00B894', type: 'income', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_freelance', name: 'Freelance', icon: 'Laptop', color: '#00CEC9', type: 'income', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_business', name: 'Business', icon: 'Building', color: '#0984E3', type: 'income', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_interest', name: 'Interest', icon: 'TrendingUp', color: '#6C5CE7', type: 'income', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_investment', name: 'Investment', icon: 'PiggyBank', color: '#FDCB6E', type: 'income', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_refund', name: 'Refund', icon: 'RotateCcw', color: '#FAB1A0', type: 'income', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_gift', name: 'Gift', icon: 'Gift', color: '#FF7675', type: 'income', isDefault: true, createdAt: new Date().toISOString() },
  { id: 'cat_other_inc', name: 'Other Income', icon: 'DollarSign', color: '#34495E', type: 'income', isDefault: true, createdAt: new Date().toISOString() },
];

export const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'acc_cash', name: 'Cash Wallet', type: 'cash', initialBalance: 5000, currency: 'INR', color: '#00B894', icon: 'Wallet', createdAt: new Date().toISOString() },
  { id: 'acc_bank', name: 'Bank Account', type: 'bank', initialBalance: 50000, currency: 'INR', color: '#0984E3', icon: 'Landmark', createdAt: new Date().toISOString() },
  { id: 'acc_upi', name: 'UPI Wallet', type: 'upi', initialBalance: 8000, currency: 'INR', color: '#6C5CE7', icon: 'Smartphone', createdAt: new Date().toISOString() },
  { id: 'acc_card', name: 'Credit Card', type: 'credit_card', initialBalance: 0, currency: 'INR', color: '#FF7675', icon: 'CreditCard', createdAt: new Date().toISOString() },
];

export const DEFAULT_PAYMENT_METHODS = [
  'UPI',
  'Cash',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Net Banking',
  'Other',
];

export const DEFAULT_INVESTMENT_TYPES = [
  'Stocks',
  'Mutual Funds',
  'Fixed Deposit',
  'Gold',
  'Crypto',
  'Real Estate',
  'SIP',
  'Other',
];

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  currency: 'INR',
  dateFormat: 'DD/MM/YYYY',
  defaultPaymentMethod: 'UPI',
  compactAmounts: false,
  startOfMonth: 1,
  securityLock: false,
  notifications: true,
  reminderTime: '20:00',
  haptics: true,
  reducedMotion: false,
  customPaymentMethods: DEFAULT_PAYMENT_METHODS,
  customInvestmentTypes: DEFAULT_INVESTMENT_TYPES,
};

export const INITIAL_SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_sample_1',
    type: 'income',
    amount: 70000,
    categoryId: 'cat_salary',
    accountId: 'acc_bank',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    note: 'Monthly Salary Credit',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 'tx_sample_2',
    type: 'expense',
    amount: 15000,
    categoryId: 'cat_rent',
    accountId: 'acc_bank',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    note: 'Apartment Rent',
    paymentMethod: 'Net Banking',
  },
  {
    id: 'tx_sample_3',
    type: 'expense',
    amount: 8500,
    categoryId: 'cat_food',
    accountId: 'acc_upi',
    date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    note: 'Groceries & Dining',
    paymentMethod: 'UPI',
  },
  {
    id: 'tx_sample_4',
    type: 'expense',
    amount: 3200,
    categoryId: 'cat_transport',
    accountId: 'acc_upi',
    date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    note: 'Fuel & Cab Fares',
    paymentMethod: 'UPI',
  },
  {
    id: 'tx_sample_5',
    type: 'expense',
    amount: 720,
    categoryId: 'cat_subscriptions',
    accountId: 'acc_card',
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    note: 'Netflix & Spotify',
    paymentMethod: 'Credit Card',
  }
];

export const DEFAULT_BUDGET: MonthlyBudget = {
  id: 'budget_default',
  month: new Date().toISOString().substring(0, 7),
  amount: 30000,
};

export type TransactionType = 'expense' | 'income' | 'transfer' | 'investment';

export type InvestmentCategory =
  | 'Stocks'
  | 'Mutual Funds'
  | 'Fixed Deposit'
  | 'Gold'
  | 'Crypto'
  | 'Real Estate'
  | 'SIP'
  | 'Other';

export type PaymentMethod =
  | 'UPI'
  | 'Cash'
  | 'Credit Card'
  | 'Debit Card'
  | 'Bank Transfer'
  | 'Net Banking'
  | 'Other';

export type TransferType = 'Friend' | 'Family' | 'Business' | 'Self Account' | 'Other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId?: string;
  accountId?: string;
  destinationAccountId?: string;
  recipientName?: string;
  transferType?: TransferType;
  investmentCategory?: InvestmentCategory | string;
  date: string; // ISO String
  createdAt: string;
  updatedAt: string;
  note?: string;
  merchant?: string;
  paymentMethod?: PaymentMethod | string;
  recurringTransactionId?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income' | 'both';
  isDefault: boolean;
  createdAt: string;
}

export type AccountType = 'cash' | 'bank' | 'upi' | 'credit_card' | 'wallet' | 'other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  currency: string;
  color: string;
  icon: string;
  createdAt: string;
}

export interface MonthlyBudget {
  id: string;
  month: string; // YYYY-MM
  amount: number;
  categoryId?: string;
}

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  accountId: string;
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string;
  lastProcessedDate?: string;
  note?: string;
  paymentMethod?: string;
}

export type ThemeMode = 'system' | 'light' | 'dark';
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';
export type DateFormatOption = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

export interface AppSettings {
  theme: ThemeMode;
  currency: CurrencyCode;
  dateFormat: DateFormatOption;
  defaultPaymentMethod: PaymentMethod;
  compactAmounts: boolean;
  startOfMonth: number; // 1 to 28
  securityLock: boolean;
  pinHash?: string;
  notifications: boolean;
  reminderTime: string; // HH:mm
  haptics: boolean;
  reducedMotion: boolean;
  customPaymentMethods?: string[];
  customInvestmentTypes?: string[];
}

export interface BackupPayload {
  version: number;
  exportedAt: string;
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  budgets: MonthlyBudget[];
  recurring: RecurringTransaction[];
  settings: AppSettings;
}

export interface FilterOptions {
  searchQuery: string;
  type?: TransactionType | 'all';
  categoryId?: string | 'all';
  accountId?: string | 'all';
  paymentMethod?: string | 'all';
  dateRangePreset?: 'this_month' | 'last_month' | 'last_3_months' | 'this_year' | 'all' | 'custom';
  startDate?: string;
  endDate?: string;
  sortBy: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
}

export interface MonthlySummary {
  month: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  categoryExpenses: Array<{
    categoryId: string;
    categoryName: string;
    color: string;
    icon: string;
    amount: number;
    percentage: number;
  }>;
}

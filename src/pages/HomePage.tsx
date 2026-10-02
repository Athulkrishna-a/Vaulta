import React from 'react';
import { Box } from '@mui/material';
import { TopHeader } from '../components/common/TopHeader';
import { MonthSummaryCard } from '../components/dashboard/MonthSummaryCard';
import { TodaysSpendCard } from '../components/dashboard/TodaysSpendCard';
import { CalendarDayStrip } from '../components/dashboard/CalendarDayStrip';
import { ExpenseDonutChart } from '../components/dashboard/ExpenseDonutChart';
import { BudgetProgressBar } from '../components/dashboard/BudgetProgressBar';
import { RecentTransactionsList } from '../components/dashboard/RecentTransactionsList';
import { Transaction } from '../types';

interface HomePageProps {
  onEditTransaction: (transaction: Transaction) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onEditTransaction }) => {
  return (
    <Box sx={{ pb: 14 }}>
      <TopHeader />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, px: 2 }}>
        {/* 1. Digital Credit Card & Dual Income/Expense Cards */}
        <MonthSummaryCard />

        {/* 2. Today's Spend Hero Card */}
        <TodaysSpendCard />

        {/* 3. Horizontal Calendar Day Selector Strip */}
        <CalendarDayStrip />

        {/* 4. Donut Category Breakdown Chart */}
        <ExpenseDonutChart />

        {/* 5. Monthly Budget Progress Indicator */}
        <BudgetProgressBar />

        {/* 6. Recent Transactions List */}
        <RecentTransactionsList onEditTransaction={onEditTransaction} />
      </Box>
    </Box>
  );
};

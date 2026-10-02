import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GlassCard } from '../common/GlassCard';
import { useAppData } from '../../app/providers/AppDataProvider';
import { calculateMonthlySummary } from '../../utils/calculations';
import { formatMonthHeader } from '../../utils/dateUtils';

export const IncomeVsExpenseChart: React.FC = () => {
  const theme = useTheme();
  const { transactions, categories } = useAppData();

  const data = React.useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const summary = calculateMonthlySummary(transactions, categories, monthKey);
      list.push({
        name: formatMonthHeader(monthKey).split(' ')[0],
        Income: summary.totalIncome,
        Expenses: summary.totalExpense,
      });
    }
    return list;
  }, [transactions, categories]);

  return (
    <GlassCard sx={{ p: 2.5, mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
        Income vs Expenses
      </Typography>
      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
        Cash flow comparison by month
      </Typography>

      <Box sx={{ width: '100%', height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" stroke={theme.palette.text.secondary} fontSize={12} />
            <YAxis stroke={theme.palette.text.secondary} fontSize={12} />
            <Tooltip
              formatter={(val: any) => [`₹${Number(val).toLocaleString()}`]}
              contentStyle={{
                borderRadius: '12px',
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
              }}
            />
            <Legend wrapperStyle={{ paddingTop: 10 }} />
            <Bar dataKey="Income" fill={theme.palette.income.main} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Expenses" fill={theme.palette.expense.main} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </GlassCard>
  );
};

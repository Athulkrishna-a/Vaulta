import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { GlassCard } from '../common/GlassCard';
import { useAppData } from '../../app/providers/AppDataProvider';
import { calculateMonthlySummary } from '../../utils/calculations';
import { formatMonthHeader } from '../../utils/dateUtils';

export const MonthlyComparisonChart: React.FC = () => {
  const theme = useTheme();
  const { transactions, categories } = useAppData();

  const monthlyData = React.useMemo(() => {
    const data = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const summary = calculateMonthlySummary(transactions, categories, monthKey);
      const label = formatMonthHeader(monthKey).split(' ')[0];

      data.push({
        monthKey,
        label,
        expense: summary.totalExpense,
        income: summary.totalIncome,
      });
    }
    return data;
  }, [transactions, categories]);

  return (
    <GlassCard sx={{ p: 2.5, mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, fontFamily: 'Space Grotesk' }}>
        Monthly Spending Trend
      </Typography>
      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
        6-month overview of your spending patterns
      </Typography>

      <Box sx={{ width: '100%', height: 230 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
            <XAxis dataKey="label" stroke={theme.palette.text.secondary} fontSize={12} tickLine={false} />
            <YAxis stroke={theme.palette.text.secondary} fontSize={12} tickLine={false} />
            <Tooltip
              formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Spent']}
              contentStyle={{
                borderRadius: '16px',
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                fontFamily: 'Space Grotesk',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              }}
            />
            <Bar
              dataKey="expense"
              fill={theme.palette.primary.main}
              radius={[8, 8, 0, 0]}
              isAnimationActive={true}
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </GlassCard>
  );
};

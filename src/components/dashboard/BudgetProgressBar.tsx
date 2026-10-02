import React from 'react';
import { Box, Typography, LinearProgress, useTheme } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { CurrencyText } from '../common/CurrencyText';
import { calculateBudgetUsage } from '../../utils/calculations';
import { useAppData } from '../../app/providers/AppDataProvider';
import { AlertCircle, Target } from 'lucide-react';

export const BudgetProgressBar: React.FC = () => {
  const theme = useTheme();
  const { currentBudget, monthlySummary } = useAppData();

  const usage = calculateBudgetUsage(monthlySummary.totalExpense, currentBudget);

  if (!currentBudget || currentBudget.amount <= 0) {
    return null; // Budget is optional
  }

  const progressValue = Math.min(usage.percentage, 100);

  return (
    <GlassCard sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Target size={18} color={theme.palette.primary.main} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Monthly Budget
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>
          {usage.percentage}% used
        </Typography>
      </Box>

      {/* Progress Bar */}
      <Box sx={{ my: 1.5 }}>
        <LinearProgress
          variant="determinate"
          value={progressValue}
          sx={{
            height: 10,
            borderRadius: '5px',
            backgroundColor: theme.palette.background.surfaceContainerHighest,
            '& .MuiLinearProgress-bar': {
              borderRadius: '5px',
              backgroundColor: usage.isExceeded ? theme.palette.error.main : theme.palette.primary.main,
            },
          }}
        />
      </Box>

      {/* Details Row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
          <CurrencyText amount={monthlySummary.totalExpense} sx={{ fontSize: '0.85rem' }} /> spent of{' '}
          <CurrencyText amount={currentBudget.amount} sx={{ fontSize: '0.85rem' }} />
        </Typography>

        {usage.isExceeded ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: theme.palette.error.main }}>
            <AlertCircle size={14} />
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              Exceeded by ₹{usage.diff.toLocaleString()}
            </Typography>
          </Box>
        ) : (
          <Typography variant="caption" sx={{ color: theme.palette.income.main, fontWeight: 600 }}>
            ₹{usage.diff.toLocaleString()} left
          </Typography>
        )}
      </Box>
    </GlassCard>
  );
};

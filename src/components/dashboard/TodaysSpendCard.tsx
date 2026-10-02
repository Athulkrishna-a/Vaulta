import React from 'react';
import { Box, Typography, Chip, useTheme } from '@mui/material';
import { TrendingDown, Sparkles } from 'lucide-react';
import { CurrencyText } from '../common/CurrencyText';
import { useAppData } from '../../app/providers/AppDataProvider';

export const TodaysSpendCard: React.FC = () => {
  const theme = useTheme();
  const { transactions } = useAppData();

  // Calculate today's spending
  const todayStr = new Date().toISOString().substring(0, 10);
  const todayExpenses = transactions
    .filter((t) => t.type === 'expense' && t.date.substring(0, 10) === todayStr)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <Box
      sx={{
        borderRadius: '24px',
        p: 2.5,
        backgroundColor: theme.palette.mode === 'dark' ? '#0F3025' : '#122D24', // Deep emerald background matching Mockup 3
        color: '#FFFFFF',
        boxShadow: '0 8px 24px rgba(18, 45, 36, 0.25)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
          TODAY'S SPEND
        </Typography>
        <Sparkles size={16} color="#00D1A7" />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, my: 0.5 }}>
        <CurrencyText
          amount={todayExpenses}
          sx={{
            fontSize: '1.8rem',
            fontWeight: 800,
            color: '#FFFFFF',
          }}
        />

        <Chip
          icon={<TrendingDown size={14} color="#00D1A7" />}
          label="↘ 6% than yesterday"
          size="small"
          sx={{
            backgroundColor: 'rgba(0, 209, 167, 0.18)',
            color: '#00D1A7',
            fontWeight: 700,
            fontSize: '0.72rem',
            borderRadius: '8px',
            '& .MuiChip-icon': {
              color: '#00D1A7',
            },
          }}
        />
      </Box>

      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.65)', fontWeight: 500 }}>
        Mostly on Food & Dining • Live Tracking
      </Typography>
    </Box>
  );
};

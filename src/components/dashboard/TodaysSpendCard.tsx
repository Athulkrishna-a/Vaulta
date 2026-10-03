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
        backgroundColor: 'rgba(6, 36, 17, 0.78)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(198, 255, 46, 0.16)',
        color: '#F0FDF4',
        boxShadow: '0 8px 24px rgba(3, 28, 12, 0.4)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" sx={{ color: '#86A789', fontWeight: 600 }}>
          TODAY'S SPEND
        </Typography>
        <Sparkles size={16} color="#C6FF2E" />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, my: 0.5 }}>
        <CurrencyText
          amount={todayExpenses}
          sx={{
            fontSize: '1.8rem',
            fontWeight: 800,
            color: '#F0FDF4',
          }}
        />

        <Chip
          icon={<TrendingDown size={14} color="#C6FF2E" />}
          label="↘ 6% than yesterday"
          size="small"
          sx={{
            backgroundColor: 'rgba(198, 255, 46, 0.16)',
            color: '#C6FF2E',
            fontWeight: 700,
            fontSize: '0.72rem',
            borderRadius: '8px',
            border: '1px solid rgba(198, 255, 46, 0.2)',
            '& .MuiChip-icon': {
              color: '#C6FF2E',
            },
          }}
        />
      </Box>

      <Typography variant="caption" sx={{ color: '#86A789', fontWeight: 500 }}>
        Mostly on Food & Dining • Live Tracking
      </Typography>
    </Box>
  );
};

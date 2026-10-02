import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Lightbulb } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { generateFinancialInsights } from '../../utils/calculations';
import { useAppData } from '../../app/providers/AppDataProvider';

export const FinancialInsights: React.FC = () => {
  const theme = useTheme();
  const { transactions, categories, currentBudget } = useAppData();

  const insights = React.useMemo(
    () => generateFinancialInsights(transactions, categories, currentBudget),
    [transactions, categories, currentBudget]
  );

  return (
    <GlassCard sx={{ p: 2.5, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Lightbulb size={20} color={theme.palette.primary.main} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Financial Insights
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {insights.map((insight, idx) => (
          <Box
            key={idx}
            sx={{
              p: 1.5,
              borderRadius: '14px',
              backgroundColor: theme.palette.background.surfaceContainer,
              borderLeft: `4px solid ${theme.palette.primary.main}`,
            }}
          >
            <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>
              {insight}
            </Typography>
          </Box>
        ))}
      </Box>
    </GlassCard>
  );
};

import React from 'react';
import { Box, Typography, useTheme, Grid } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { GlassCard } from '../common/GlassCard';
import { CurrencyText } from '../common/CurrencyText';
import { CategoryIcon } from '../common/CategoryIcon';
import { useAppData } from '../../app/providers/AppDataProvider';
import { useNavigate } from 'react-router-dom';
import { PieChart as PieIcon } from 'lucide-react';

export const ExpenseDonutChart: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { monthlySummary } = useAppData();

  const { categoryExpenses, totalExpense } = monthlySummary;

  if (categoryExpenses.length === 0 || totalExpense === 0) {
    return (
      <GlassCard sx={{ p: 3, textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/statistics')}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
          <PieIcon size={20} color={theme.palette.primary.main} />
          <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Space Grotesk' }}>
            Monthly Spending Breakdown
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, py: 2 }}>
          No expenses recorded for this month yet. Tap + to add your first expense!
        </Typography>
      </GlassCard>
    );
  }

  return (
    <GlassCard
      hoverEffect
      onClick={() => navigate('/statistics')}
      sx={{ p: 2.5, cursor: 'pointer' }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk' }}>
          Monthly Spending
        </Typography>
        <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 700, fontFamily: 'Space Grotesk' }}>
          View Details →
        </Typography>
      </Box>

      {/* Donut Chart with Animated Entrance & Glowing Overlay */}
      <Box sx={{ position: 'relative', width: '100%', height: 215 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryExpenses}
              dataKey="amount"
              nameKey="categoryName"
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={92}
              paddingAngle={5}
              stroke="none"
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {categoryExpenses.map((entry) => (
                <Cell key={entry.categoryId} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Spent']}
              contentStyle={{
                borderRadius: '16px',
                background: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                fontFamily: 'Space Grotesk',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <CurrencyText amount={totalExpense} sx={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Space Grotesk' }} />
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block', fontSize: '0.75rem' }}>
            spent
          </Typography>
        </Box>
      </Box>

      {/* Category Pills Grid */}
      <Grid container spacing={1.5} sx={{ mt: 1 }}>
        {categoryExpenses.slice(0, 4).map((item) => (
          <Grid key={item.categoryId} size={{ xs: 6 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1.2,
                borderRadius: '16px',
                backgroundColor: theme.palette.background.surfaceContainer,
              }}
            >
              <CategoryIcon name={item.icon} size={15} color="#FFF" backgroundColor={item.color} />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="caption"
                  noWrap
                  sx={{ fontWeight: 700, color: theme.palette.text.primary, display: 'block', fontFamily: 'Space Grotesk' }}
                >
                  {item.categoryName}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.7rem' }}>
                  {item.percentage}% (₹{item.amount.toLocaleString()})
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </GlassCard>
  );
};

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  useTheme,
  Chip,
  TextField,
  InputAdornment,
  Button,
} from '@mui/material';
import { ChevronLeft, ChevronRight, Search, Calendar as CalendarIcon, SlidersHorizontal, X } from 'lucide-react';
import { format } from 'date-fns';
import { ExpenseDonutChart } from '../components/dashboard/ExpenseDonutChart';
import { MonthlyComparisonChart } from '../components/statistics/MonthlyComparisonChart';
import { IncomeVsExpenseChart } from '../components/statistics/IncomeVsExpenseChart';
import { FinancialInsights } from '../components/statistics/FinancialInsights';
import { useAppData } from '../app/providers/AppDataProvider';
import { formatMonthHeader } from '../utils/dateUtils';
import { GlassCard } from '../components/common/GlassCard';
import { CategoryIcon } from '../components/common/CategoryIcon';
import { CurrencyText } from '../components/common/CurrencyText';
import { CustomDatePickerModal } from '../components/common/CustomDatePickerModal';

export const StatisticsPage: React.FC = () => {
  const theme = useTheme();
  const { activeMonth, setActiveMonth, monthlySummary, transactions } = useAppData();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [datePreset, setDatePreset] = useState<'this_month' | 'last_month' | 'last_3_months' | 'this_year'>('this_month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [datePickerOpen, setDatePickerOpen] = useState<boolean>(false);

  const handlePrevMonth = () => {
    const [year, month] = activeMonth.split('-').map(Number);
    const d = new Date(year, month - 2, 1);
    const prevKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    setActiveMonth(prevKey);
  };

  const handleNextMonth = () => {
    const [year, month] = activeMonth.split('-').map(Number);
    const d = new Date(year, month, 1);
    const nextKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    setActiveMonth(nextKey);
  };

  const handlePresetSelect = (preset: 'this_month' | 'last_month' | 'last_3_months' | 'this_year') => {
    setDatePreset(preset);
    const now = new Date();
    if (preset === 'this_month') {
      setActiveMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    } else if (preset === 'last_month') {
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      setActiveMonth(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`);
    }
  };

  // Filtered category breakdown list
  const filteredCategoryExpenses = useMemo(() => {
    if (!searchQuery.trim()) return monthlySummary.categoryExpenses;
    const q = searchQuery.toLowerCase();
    return monthlySummary.categoryExpenses.filter((c) => c.categoryName.toLowerCase().includes(q));
  }, [monthlySummary, searchQuery]);

  return (
    <Box sx={{ p: 2, pb: 14 }}>
      {/* Top Title & Month Navigator */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk' }}>
          Financial Analytics
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: theme.palette.background.surfaceContainerHigh,
            borderRadius: '16px',
            p: 0.5,
          }}
        >
          <IconButton size="small" onClick={handlePrevMonth}>
            <ChevronLeft size={20} />
          </IconButton>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, px: 1, minWidth: 100, textAlign: 'center', fontFamily: 'Space Grotesk' }}>
            {formatMonthHeader(activeMonth)}
          </Typography>
          <IconButton size="small" onClick={handleNextMonth}>
            <ChevronRight size={20} />
          </IconButton>
        </Box>
      </Box>

      {/* Date Presets Row */}
      <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, mb: 2, '::-webkit-scrollbar': { display: 'none' } }}>
        <Chip
          label="This Month"
          onClick={() => handlePresetSelect('this_month')}
          color={datePreset === 'this_month' ? 'primary' : 'default'}
          variant={datePreset === 'this_month' ? 'filled' : 'outlined'}
          sx={{ fontFamily: 'Space Grotesk', fontWeight: 700 }}
        />
        <Chip
          label="Last Month"
          onClick={() => handlePresetSelect('last_month')}
          color={datePreset === 'last_month' ? 'primary' : 'default'}
          variant={datePreset === 'last_month' ? 'filled' : 'outlined'}
          sx={{ fontFamily: 'Space Grotesk', fontWeight: 700 }}
        />
        <Chip
          label="Last 3 Months"
          onClick={() => handlePresetSelect('last_3_months')}
          color={datePreset === 'last_3_months' ? 'primary' : 'default'}
          variant={datePreset === 'last_3_months' ? 'filled' : 'outlined'}
          sx={{ fontFamily: 'Space Grotesk', fontWeight: 700 }}
        />
        <Chip
          label="This Year"
          onClick={() => handlePresetSelect('this_year')}
          color={datePreset === 'this_year' ? 'primary' : 'default'}
          variant={datePreset === 'this_year' ? 'filled' : 'outlined'}
          sx={{ fontFamily: 'Space Grotesk', fontWeight: 700 }}
        />
      </Box>

      {/* Custom Date Range Picker Trigger Row */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
        <Button
          fullWidth
          variant={customStartDate || customEndDate ? 'contained' : 'outlined'}
          startIcon={<CalendarIcon size={18} />}
          endIcon={customStartDate || customEndDate ? <X size={16} onClick={(e) => { e.stopPropagation(); setCustomStartDate(''); setCustomEndDate(''); }} /> : undefined}
          onClick={() => setDatePickerOpen(true)}
          sx={{
            borderRadius: '16px',
            py: 1,
            fontWeight: 700,
            fontFamily: 'Space Grotesk',
            fontSize: '0.82rem',
            backgroundColor: customStartDate || customEndDate ? theme.palette.primary.main : 'rgba(255,255,255,0.04)',
            color: customStartDate || customEndDate ? '#FFFFFF' : theme.palette.text.primary,
            border: customStartDate || customEndDate ? 'none' : '1px solid rgba(255,255,255,0.1)',
            justifyContent: 'space-between',
            px: 2,
          }}
        >
          {customStartDate || customEndDate
            ? `${customStartDate ? format(new Date(customStartDate), 'dd MMM') : ''} - ${customEndDate ? format(new Date(customEndDate), 'dd MMM yyyy') : 'Now'}`
            : 'Choose Custom Date Range'}
        </Button>
      </Box>

      {/* Custom Date Picker Modal */}
      <CustomDatePickerModal
        open={datePickerOpen}
        onClose={() => setDatePickerOpen(false)}
        startDate={customStartDate}
        endDate={customEndDate}
        onApply={(s, e) => {
          setCustomStartDate(s || '');
          setCustomEndDate(e || '');
        }}
      />

      {/* Analytics Search Filter Bar */}
      <TextField
        fullWidth
        size="small"
        placeholder="Filter analytics by category name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} color={theme.palette.text.secondary} />
              </InputAdornment>
            ),
            sx: { borderRadius: '16px', backgroundColor: theme.palette.background.paper, mb: 2 },
          },
        }}
      />

      {/* 1. Donut Expense Breakdown Chart */}
      <Box sx={{ mb: 3 }}>
        <ExpenseDonutChart />
      </Box>

      {/* 2. Top Category Spending Breakdown List */}
      <GlassCard sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, fontFamily: 'Space Grotesk' }}>
          Category Expenses Breakdown
        </Typography>

        {filteredCategoryExpenses.length === 0 ? (
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: 'center', py: 2 }}>
            No matching category expenses found.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {filteredCategoryExpenses.map((cat) => (
              <Box
                key={cat.categoryId}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.4,
                  borderRadius: '18px',
                  backgroundColor: theme.palette.background.surfaceContainer,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CategoryIcon name={cat.icon} size={18} color="#FFF" backgroundColor={cat.color} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk' }}>
                      {cat.categoryName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      {cat.percentage}% of total spending
                    </Typography>
                  </Box>
                </Box>
                <CurrencyText amount={cat.amount} type="expense" sx={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'Space Grotesk' }} />
              </Box>
            ))}
          </Box>
        )}
      </GlassCard>

      {/* 3. Monthly Spending Trends Bar Chart */}
      <MonthlyComparisonChart />

      {/* 4. Income vs Expense Cash Flow Bar Chart */}
      <IncomeVsExpenseChart />

      {/* 5. Automated Data Insights */}
      <FinancialInsights />
    </Box>
  );
};

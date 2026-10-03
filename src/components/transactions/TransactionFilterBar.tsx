import React, { useState } from 'react';
import { Box, TextField, MenuItem, Chip, InputAdornment, IconButton, Button, useTheme } from '@mui/material';
import { Search, X, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { FilterOptions } from '../../types';
import { useAppData } from '../../app/providers/AppDataProvider';
import { CustomDatePickerModal } from '../common/CustomDatePickerModal';
import { format } from 'date-fns';

interface TransactionFilterBarProps {
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
}

export const TransactionFilterBar: React.FC<TransactionFilterBarProps> = ({
  filters,
  onChange,
}) => {
  const theme = useTheme();
  const { categories } = useAppData();
  const [datePickerOpen, setDatePickerOpen] = useState<boolean>(false);

  const handleTypeChange = (type: FilterOptions['type']) => {
    onChange({ ...filters, type });
  };

  const handleApplyCustomDates = (startDate?: string, endDate?: string) => {
    onChange({
      ...filters,
      startDate,
      endDate,
    });
  };

  const hasDateFilter = Boolean(filters.startDate || filters.endDate);

  const dateFilterLabel = hasDateFilter
    ? `${filters.startDate ? format(new Date(filters.startDate), 'dd MMM') : ''} - ${
        filters.endDate ? format(new Date(filters.endDate), 'dd MMM yyyy') : 'Now'
      }`
    : 'Choose Date Range';

  return (
    <Box sx={{ mb: 2 }}>
      {/* Search Input & Custom Date Filter in ONE Single Row */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search transactions, notes, amounts..."
          value={filters.searchQuery}
          onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} color={theme.palette.text.secondary} />
                </InputAdornment>
              ),
              endAdornment: filters.searchQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => onChange({ ...filters, searchQuery: '' })}>
                    <X size={16} />
                  </IconButton>
                </InputAdornment>
              ) : null,
              sx: { borderRadius: '16px', backgroundColor: theme.palette.background.paper, height: 42 },
            },
          }}
        />

        <Button
          variant={hasDateFilter ? 'contained' : 'outlined'}
          startIcon={<CalendarIcon size={18} />}
          endIcon={hasDateFilter ? <X size={16} onClick={(e) => { e.stopPropagation(); onChange({ ...filters, startDate: undefined, endDate: undefined }); }} /> : undefined}
          onClick={() => setDatePickerOpen(true)}
          sx={{
            borderRadius: '16px',
            height: 42,
            px: 1.8,
            flexShrink: 0,
            whiteSpace: 'nowrap',
            fontWeight: 700,
            fontFamily: 'Space Grotesk',
            fontSize: '0.8rem',
            backgroundColor: hasDateFilter ? theme.palette.primary.main : 'rgba(255,255,255,0.05)',
            color: hasDateFilter ? '#FFFFFF' : theme.palette.text.primary,
            border: hasDateFilter ? 'none' : '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {dateFilterLabel}
        </Button>
      </Box>

      {/* Type & Category Chips */}
      <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, '::-webkit-scrollbar': { display: 'none' } }}>
        <Chip
          label="All"
          onClick={() => handleTypeChange('all')}
          color={filters.type === 'all' || !filters.type ? 'primary' : 'default'}
          variant={filters.type === 'all' || !filters.type ? 'filled' : 'outlined'}
        />
        <Chip
          label="Expenses"
          onClick={() => handleTypeChange('expense')}
          color={filters.type === 'expense' ? 'error' : 'default'}
          variant={filters.type === 'expense' ? 'filled' : 'outlined'}
        />
        <Chip
          label="Income"
          onClick={() => handleTypeChange('income')}
          color={filters.type === 'income' ? 'success' : 'default'}
          variant={filters.type === 'income' ? 'filled' : 'outlined'}
        />
        <Chip
          label="Transfers"
          onClick={() => handleTypeChange('transfer')}
          color={filters.type === 'transfer' ? 'secondary' : 'default'}
          variant={filters.type === 'transfer' ? 'filled' : 'outlined'}
        />

        <TextField
          select
          size="small"
          value={filters.categoryId || 'all'}
          onChange={(e) => onChange({ ...filters, categoryId: e.target.value })}
          sx={{ minWidth: 130, '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
        >
          <MenuItem value="all">All Categories</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          value={filters.sortBy}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
          sx={{ minWidth: 140, '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
        >
          <MenuItem value="date_desc">Newest First</MenuItem>
          <MenuItem value="date_asc">Oldest First</MenuItem>
          <MenuItem value="amount_desc">Highest Amount</MenuItem>
          <MenuItem value="amount_asc">Lowest Amount</MenuItem>
        </TextField>
      </Box>

      {/* Custom Date Picker Modal */}
      <CustomDatePickerModal
        open={datePickerOpen}
        onClose={() => setDatePickerOpen(false)}
        startDate={filters.startDate}
        endDate={filters.endDate}
        onApply={handleApplyCustomDates}
      />
    </Box>
  );
};

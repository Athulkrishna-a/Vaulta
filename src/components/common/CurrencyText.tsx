import React from 'react';
import { Typography, TypographyProps } from '@mui/material';
import { formatCurrency } from '../../utils/currency';
import { useAppData } from '../../app/providers/AppDataProvider';

interface CurrencyTextProps extends Omit<TypographyProps, 'children'> {
  amount: number;
  type?: 'expense' | 'income' | 'neutral';
  compact?: boolean;
  showSign?: boolean;
}

export const CurrencyText: React.FC<CurrencyTextProps> = ({
  amount,
  type = 'neutral',
  compact = false,
  showSign = false,
  sx,
  ...rest
}) => {
  const { settings } = useAppData();
  const formatted = formatCurrency(Math.abs(amount), settings.currency, compact);

  let sign = '';
  if (showSign) {
    if (type === 'income' || amount > 0) sign = '+';
    if (type === 'expense' || amount < 0) sign = '-';
  } else if (amount < 0) {
    sign = '-';
  }

  return (
    <Typography
      component="span"
      sx={{
        fontWeight: 700,
        fontFeatureSettings: '"tnum"', // Tabular numbers for clean financial alignment
        color: (theme) => {
          if (type === 'income') return theme.palette.income.main;
          if (type === 'expense') return theme.palette.expense.main;
          return 'inherit';
        },
        ...sx,
      }}
      {...rest}
    >
      {sign}
      {formatted}
    </Typography>
  );
};

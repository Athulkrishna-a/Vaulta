import React, { useState } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem, useTheme } from '@mui/material';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Transaction } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';
import { CurrencyText } from '../common/CurrencyText';
import { formatTransactionDate } from '../../utils/dateUtils';
import { useAppData } from '../../app/providers/AppDataProvider';

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();
  const { categories, accounts } = useAppData();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const category = categories.find((c) => c.id === transaction.categoryId);
  const account = accounts.find((a) => a.id === transaction.accountId);

  const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const isTransfer = transaction.type === 'transfer';
  const iconName = isTransfer ? 'ArrowLeftRight' : category ? category.icon : 'Tag';
  const iconBg = isTransfer ? theme.palette.transfer.main : category ? category.color : '#9E9E9E';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1.8,
        px: 2,
        borderRadius: '20px',
        backgroundColor: theme.palette.background.paper,
        mb: 1.2,
        boxShadow: theme.palette.mode === 'light' ? '0 4px 14px rgba(0, 0, 0, 0.03)' : 'none',
        border: `1px solid ${theme.palette.divider}`,
        transition: 'transform 0.18s ease, background-color 0.18s ease',
        '&:active': {
          transform: 'scale(0.99)',
        },
      }}
    >
      {/* Category Icon Badge */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8, minWidth: 0, flex: 1 }}>
        <CategoryIcon name={iconName} size={20} color="#FFF" backgroundColor={iconBg} />

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="subtitle2"
            noWrap
            sx={{ fontWeight: 800, color: theme.palette.text.primary, lineHeight: 1.2, fontSize: '0.95rem' }}
          >
            {transaction.note || transaction.merchant || (category ? category.name : 'Uncategorized')}
          </Typography>

          <Typography
            variant="caption"
            noWrap
            sx={{ color: theme.palette.text.secondary, display: 'block', mt: 0.2, fontSize: '0.74rem' }}
          >
            {category ? category.name : 'Transaction'} • {transaction.paymentMethod || (account ? account.name : 'Cash')}
          </Typography>
        </Box>
      </Box>

      {/* Amount & Time Display matching Mockups 2 & 3 */}
      <Box sx={{ textAlign: 'right', mr: 0.5 }}>
        <CurrencyText
          amount={transaction.amount}
          type={transaction.type === 'expense' ? 'expense' : transaction.type === 'income' ? 'income' : 'neutral'}
          showSign={transaction.type !== 'transfer'}
          sx={{ fontSize: '1.05rem', fontWeight: 800, display: 'block' }}
        />
        <Typography variant="caption" sx={{ color: theme.palette.text.disabled, fontSize: '0.7rem' }}>
          {formatTransactionDate(transaction.date)}
        </Typography>
      </Box>

      <IconButton size="small" onClick={handleMenuOpen} sx={{ color: theme.palette.text.secondary, ml: 0.5 }}>
        <MoreVertical size={18} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        slotProps={{
          paper: {
            sx: { borderRadius: '16px', minWidth: 140 },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onEdit(transaction);
          }}
        >
          <Edit2 size={16} style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onDelete(transaction.id);
          }}
          sx={{ color: theme.palette.error.main }}
        >
          <Trash2 size={16} style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

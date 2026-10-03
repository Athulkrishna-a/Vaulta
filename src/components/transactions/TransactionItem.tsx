import React, { useState } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip } from '@mui/material';
import { MoreVertical, Edit2, Trash2, Eye, X, Calendar, Wallet, CreditCard, Tag, User } from 'lucide-react';
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
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);

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
  const isInvestment = transaction.type === 'investment';

  const categoryName = isTransfer
    ? (transaction.transferType ? `${transaction.transferType} Transfer` : 'Transfer')
    : isInvestment
    ? (transaction.investmentCategory || 'Investment')
    : category
    ? category.name
    : 'Uncategorized';

  const iconName = isTransfer ? 'ArrowLeftRight' : isInvestment ? 'TrendingUp' : category ? category.icon : 'Tag';
  const iconBg = isTransfer ? '#7C4DFF' : isInvestment ? '#FFD600' : category ? category.color : '#9E9E9E';

  const displayTitle = isTransfer
    ? (transaction.recipientName ? `${transaction.recipientName}` : categoryName)
    : isInvestment
    ? (transaction.note || transaction.investmentCategory || 'Investment')
    : (transaction.note || categoryName);

  const typeThemeColor =
    transaction.type === 'expense'
      ? '#FF5252'
      : transaction.type === 'income'
      ? '#00F5A0'
      : transaction.type === 'transfer'
      ? '#7C4DFF'
      : '#FFD600';

  return (
    <>
      <Box
        onClick={() => setDetailsOpen(true)}
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
          cursor: 'pointer',
          transition: 'transform 0.18s ease, background-color 0.18s ease',
          '&:active': {
            transform: 'scale(0.99)',
          },
        }}
      >
        {/* Category Icon Badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8, minWidth: 0, flex: 1 }}>
          <CategoryIcon name={iconName} size={20} color={isInvestment ? '#0B0E17' : '#FFF'} backgroundColor={iconBg} />

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="subtitle2"
              noWrap
              sx={{ fontWeight: 800, color: theme.palette.text.primary, lineHeight: 1.2, fontSize: '0.95rem' }}
            >
              {displayTitle}
            </Typography>

            <Typography
              variant="caption"
              noWrap
              sx={{ color: theme.palette.text.secondary, display: 'block', mt: 0.2, fontSize: '0.74rem' }}
            >
              {categoryName} • {transaction.paymentMethod || (account ? account.name : 'Cash')}
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
              sx: { borderRadius: '16px', minWidth: 150 },
            },
          }}
        >
          <MenuItem
            onClick={() => {
              handleMenuClose();
              setDetailsOpen(true);
            }}
          >
            <Eye size={16} style={{ marginRight: 8 }} />
            View Details
          </MenuItem>
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

      {/* Transaction Details Modal Popup */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: {
              borderRadius: '28px',
              p: 2,
              background: 'radial-gradient(ellipse 90% 50% at 50% 0%, rgba(18, 24, 38, 0.98) 0%, rgba(11, 14, 23, 0.98) 100%)',
              color: '#F4F6FC',
              border: `1.5px solid ${typeThemeColor}40`,
              boxShadow: `0 20px 50px rgba(0, 0, 0, 0.85), 0 0 25px ${typeThemeColor}25`,
              backdropFilter: 'blur(25px)',
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Chip
            label={transaction.type.toUpperCase()}
            size="small"
            sx={{
              backgroundColor: `${typeThemeColor}25`,
              color: typeThemeColor,
              fontWeight: 800,
              fontFamily: 'Space Grotesk',
              border: `1px solid ${typeThemeColor}`,
            }}
          />
          <IconButton
            size="small"
            onClick={() => setDetailsOpen(false)}
            sx={{
              color: '#F4F6FC',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              width: 34,
              height: 34,
              borderRadius: '50%',
            }}
          >
            <X size={18} />
          </IconButton>
        </Box>

        <DialogTitle sx={{ p: 0, mb: 1, textAlign: 'center' }}>
          <CurrencyText
            amount={transaction.amount}
            type={transaction.type === 'expense' ? 'expense' : transaction.type === 'income' ? 'income' : 'neutral'}
            showSign={transaction.type !== 'transfer'}
            sx={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'Space Grotesk' }}
          />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk', color: '#F4F6FC', mt: 0.5 }}>
            {displayTitle}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 0, py: 1.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, background: 'rgba(255,255,255,0.03)', p: 2, borderRadius: '20px', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#8A95AD', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                Category / Asset
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk', color: '#F4F6FC' }}>
                {categoryName}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#8A95AD', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                Payment Method
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk', color: '#F4F6FC' }}>
                {transaction.paymentMethod || 'UPI'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#8A95AD', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                Date & Time
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'Space Grotesk', color: '#8A95AD' }}>
                {formatTransactionDate(transaction.date)}
              </Typography>
            </Box>

            {transaction.note && (
              <Box sx={{ pt: 1, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <Typography variant="caption" sx={{ color: '#8A95AD', fontWeight: 700, fontFamily: 'Space Grotesk', display: 'block', mb: 0.3 }}>
                  Note / Description
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'Space Grotesk', color: '#F4F6FC' }}>
                  {transaction.note}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 0, pt: 1, gap: 1 }}>
          <Button
            size="small"
            onClick={() => {
              setDetailsOpen(false);
              onDelete(transaction.id);
            }}
            sx={{ color: '#FF5252', fontWeight: 700, textTransform: 'none', fontFamily: 'Space Grotesk' }}
          >
            Delete
          </Button>

          <Button
            variant="contained"
            onClick={() => {
              setDetailsOpen(false);
              onEdit(transaction);
            }}
            sx={{
              borderRadius: '14px',
              backgroundColor: typeThemeColor,
              color: transaction.type === 'income' || transaction.type === 'investment' ? '#0B0E17' : '#FFFFFF',
              fontWeight: 800,
              fontFamily: 'Space Grotesk',
              px: 3,
            }}
          >
            Edit Transaction
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

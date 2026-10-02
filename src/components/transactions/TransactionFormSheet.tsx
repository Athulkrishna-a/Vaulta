import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  IconButton,
  Chip,
  Grid,
  TextField,
  useTheme,
} from '@mui/material';
import { ArrowLeft, ChevronDown, ChevronUp, Delete, User, Users, Briefcase, RefreshCw, Check, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction, TransactionType, PaymentMethod, TransferType, InvestmentCategory } from '../../types';
import { useAppData } from '../../app/providers/AppDataProvider';
import { CategoryIcon } from '../common/CategoryIcon';
import { useHaptics } from '../../hooks/useHaptics';
import { formatCurrency } from '../../utils/currency';

interface TransactionFormSheetProps {
  open: boolean;
  onClose: () => void;
  initialData?: Transaction | null;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Cash',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Net Banking',
  'Other',
];

const TRANSFER_TYPES: { type: TransferType; label: string; icon: any }[] = [
  { type: 'Friend', label: 'Friend', icon: User },
  { type: 'Family', label: 'Family', icon: Users },
  { type: 'Business', label: 'Business', icon: Briefcase },
  { type: 'Self Account', label: 'Self Account', icon: RefreshCw },
];

const INVESTMENT_CATEGORIES: InvestmentCategory[] = [
  'Stocks',
  'Mutual Funds',
  'Fixed Deposit',
  'Gold',
  'Crypto',
  'Real Estate',
  'SIP',
  'Other',
];

export const TransactionFormSheet: React.FC<TransactionFormSheetProps> = ({
  open,
  onClose,
  initialData,
}) => {
  const theme = useTheme();
  const haptics = useHaptics();
  const {
    categories,
    accounts,
    paymentMethods,
    investmentTypes,
    addTransaction,
    updateTransaction,
    totalBalance,
    settings,
  } = useAppData();

  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('0');
  const [categoryId, setCategoryId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [destinationAccountId, setDestinationAccountId] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('Selma Knight');
  const [transferType, setTransferType] = useState<TransferType>('Friend');
  const [investmentCategory, setInvestmentCategory] = useState<string>('Mutual Funds');
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [date, setDate] = useState<string>(new Date().toISOString());
  const [note, setNote] = useState<string>('');
  const [merchant, setMerchant] = useState<string>('');

  // Expand / Collapse toggles
  const [expandCategories, setExpandCategories] = useState<boolean>(false);
  const [expandAccounts, setExpandAccounts] = useState<boolean>(false);
  const [showMoreFields, setShowMoreFields] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setType(initialData.type);
        setAmountStr(initialData.amount.toString());
        setCategoryId(initialData.categoryId || '');
        setAccountId(initialData.accountId || (accounts[0]?.id ?? ''));
        setDestinationAccountId(initialData.destinationAccountId || '');
        setRecipientName(initialData.recipientName || 'Selma Knight');
        setTransferType(initialData.transferType || 'Friend');
        setInvestmentCategory((initialData.investmentCategory as InvestmentCategory) || 'Mutual Funds');
        setPaymentMethod(initialData.paymentMethod || 'UPI');
        setDate(initialData.date);
        setNote(initialData.note || '');
        setMerchant(initialData.merchant || '');
      } else {
        setType('expense');
        setAmountStr('0');
        const defaultCat = categories.find((c) => c.type === 'expense' || c.type === 'both');
        setCategoryId(defaultCat ? defaultCat.id : (categories[0]?.id ?? ''));
        setAccountId(accounts[0]?.id || '');
        setDestinationAccountId(accounts[1]?.id || '');
        setRecipientName('Selma Knight');
        setTransferType('Friend');
        setInvestmentCategory('Mutual Funds');
        setPaymentMethod('UPI');
        setDate(new Date().toISOString());
        setNote('');
        setMerchant('');
      }
      setExpandCategories(false);
      setExpandAccounts(false);
      setShowMoreFields(false);
    }
  }, [open, initialData, categories, accounts]);

  const selectedCategory = categories.find((c) => c.id === categoryId) || categories[0];
  const selectedAccount = accounts.find((a) => a.id === accountId) || accounts[0];
  const selectedDestAccount = accounts.find((a) => a.id === destinationAccountId) || accounts[1];

  const filteredCategories = categories.filter(
    (c) => c.type === type || c.type === 'both' || type === 'transfer'
  );

  // Visible category buttons (4 items initially in 2x2 grid, expanded when toggled)
  const visibleCategories = expandCategories ? filteredCategories : filteredCategories.slice(0, 4);
  const visibleAccounts = expandAccounts ? accounts : accounts.slice(0, 4);

  const handleKeypadPress = (val: string) => {
    haptics.impactLight();
    if (val === 'clear') {
      setAmountStr('0');
      return;
    }
    if (val === 'backspace') {
      setAmountStr((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
      return;
    }
    if (val === '.') {
      if (!amountStr.includes('.')) setAmountStr((prev) => prev + '.');
      return;
    }

    if (amountStr === '0') {
      setAmountStr(val);
    } else {
      if (amountStr.length < 10) setAmountStr((prev) => prev + val);
    }
  };

  const handleTypeChange = (_: any, newType: TransactionType | null) => {
    if (newType) {
      haptics.impactLight();
      setType(newType);
      const matched = categories.find((c) => c.type === newType || c.type === 'both');
      if (matched) setCategoryId(matched.id);
    }
  };

  const handleSubmit = async () => {
    const numAmount = parseFloat(amountStr);
    if (isNaN(numAmount) || numAmount <= 0) {
      haptics.notifyError();
      return;
    }

    const payload = {
      type,
      amount: numAmount,
      categoryId: (type === 'expense' || type === 'income') ? categoryId : undefined,
      accountId: accountId || undefined,
      destinationAccountId: type === 'transfer' ? destinationAccountId : undefined,
      recipientName: type === 'transfer' ? recipientName : undefined,
      transferType: type === 'transfer' ? transferType : undefined,
      investmentCategory: type === 'investment' ? investmentCategory : undefined,
      paymentMethod,
      date,
      note: note.trim() || undefined,
      merchant: merchant.trim() || undefined,
    };

    if (initialData) {
      await updateTransaction({
        ...initialData,
        ...payload,
      });
      haptics.notifySuccess();
    } else {
      await addTransaction(payload);
      haptics.notifySuccess();
    }

    onClose();
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            borderRadius: '32px 32px 0 0',
            maxHeight: '94vh',
            backgroundColor: '#0F1118',
            color: '#FFFFFF',
            p: 2.5,
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          },
        },
      }}
    >
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {/* Header: Back Arrow & 3-Tab Segmented Selector */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <IconButton
            onClick={onClose}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#FFFFFF',
              width: 42,
              height: 42,
              borderRadius: '50%',
            }}
          >
            <ArrowLeft size={20} />
          </IconButton>

          <ToggleButtonGroup
            value={type}
            exclusive
            onChange={handleTypeChange}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              p: 0.5,
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              '& .MuiToggleButton-root': {
                border: 'none',
                borderRadius: '20px !important',
                fontWeight: 700,
                fontSize: '0.8rem',
                px: 2,
                py: 0.6,
                color: '#8A92A6',
                fontFamily: 'Space Grotesk',
                '&.Mui-selected': {
                  backgroundColor:
                    type === 'expense'
                      ? '#FF7675'
                      : type === 'income'
                      ? '#00B894'
                      : type === 'transfer'
                      ? '#6C5CE7'
                      : '#F1C40F',
                  color: type === 'investment' ? '#000000' : '#FFFFFF',
                },
              },
            }}
          >
            <ToggleButton value="expense">Expense</ToggleButton>
            <ToggleButton value="income">Income</ToggleButton>
            <ToggleButton value="transfer">Transfer</ToggleButton>
            <ToggleButton value="investment">Invest</ToggleButton>
          </ToggleButtonGroup>

          <Box sx={{ width: 42 }} />
        </Box>

        {/* 1. Large Amount Display with Blinking Cursor */}
        <Box sx={{ textAlign: 'center', py: 1.2, mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                fontFamily: 'Space Grotesk',
                color: '#FFFFFF',
                fontSize: '2.6rem',
              }}
            >
              {settings.currency === 'INR' ? '₹' : '$'}
              {amountStr}
            </Typography>

            <Box
              component={motion.div}
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              sx={{
                width: 3,
                height: 40,
                backgroundColor: '#8C7CFF',
                borderRadius: '2px',
                ml: 0.5,
              }}
            />
          </Box>

          <Typography
            variant="caption"
            sx={{ color: '#8A92A6', fontWeight: 600, fontFamily: 'Space Grotesk', mt: 0.5, display: 'block' }}
          >
            Available Balance ({formatCurrency(totalBalance, settings.currency)})
          </Typography>
        </Box>

        {/* 2. Horizontal Button Row: Payment Method Buttons (Scrollable) */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            sx={{ color: '#8A92A6', fontWeight: 700, fontFamily: 'Space Grotesk', mb: 1, display: 'block' }}
          >
            PAYMENT METHOD
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              overflowX: 'auto',
              pb: 0.5,
              whiteSpace: 'nowrap',
              WebkitOverflowScrolling: 'touch',
              '::-webkit-scrollbar': { display: 'none' },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
          >
            {paymentMethods.map((pm) => {
              const isSelected = paymentMethod === pm;
              return (
                <Button
                  key={pm}
                  size="small"
                  onClick={() => {
                    haptics.impactLight();
                    setPaymentMethod(pm);
                  }}
                  sx={{
                    borderRadius: '14px',
                    px: 2,
                    py: 0.8,
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    fontFamily: 'Space Grotesk',
                    backgroundColor: isSelected ? '#6C5CE7' : 'rgba(255, 255, 255, 0.06)',
                    color: isSelected ? '#FFFFFF' : '#8A92A6',
                    border: isSelected ? '1px solid #8C7CFF' : '1px solid transparent',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    '&:active': { transform: 'scale(0.96)' },
                  }}
                >
                  {pm}
                </Button>
              );
            })}
          </Box>
        </Box>

        {/* 3. Horizontal 2-Column Grid Category Selector with Expand/Collapse Toggle Button */}
        {(type === 'expense' || type === 'income') && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ color: '#8A92A6', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                SELECT CATEGORY
              </Typography>
              {filteredCategories.length > 4 && (
                <Button
                  size="small"
                  onClick={() => setExpandCategories(!expandCategories)}
                  startIcon={expandCategories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  sx={{ color: '#6C5CE7', fontWeight: 700, fontSize: '0.75rem', textTransform: 'none' }}
                >
                  {expandCategories ? 'Collapse' : `Expand (+${filteredCategories.length - 4} more)`}
                </Button>
              )}
            </Box>

            {/* 2-Column Grid */}
            <Grid container spacing={1}>
              {visibleCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <Grid key={cat.id} size={{ xs: 6 }}>
                    <Box
                      onClick={() => {
                        haptics.impactLight();
                        setCategoryId(cat.id);
                      }}
                      sx={{
                        p: 1.2,
                        px: 1.5,
                        borderRadius: '16px',
                        backgroundColor: isSelected ? cat.color : 'rgba(255, 255, 255, 0.05)',
                        color: isSelected ? '#FFFFFF' : '#D0D5E0',
                        border: isSelected ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.2,
                        cursor: 'pointer',
                        transition: 'transform 0.12s ease',
                        '&:active': { transform: 'scale(0.97)' },
                      }}
                    >
                      <CategoryIcon
                        name={cat.icon}
                        size={18}
                        color="#FFF"
                        backgroundColor={isSelected ? 'rgba(0,0,0,0.2)' : cat.color}
                      />
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{ fontWeight: 700, fontFamily: 'Space Grotesk', fontSize: '0.85rem' }}
                      >
                        {cat.name}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* 4. Investment Asset Selector (When Investment Tab Active) */}
        {type === 'investment' && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{ color: '#8A92A6', fontWeight: 700, fontFamily: 'Space Grotesk', mb: 1, display: 'block' }}
            >
              SELECT INVESTMENT TYPE / ASSET
            </Typography>
            <Grid container spacing={1}>
              {investmentTypes.map((invCat) => {
                const isSelected = investmentCategory === invCat;
                return (
                  <Grid key={invCat} size={{ xs: 6 }}>
                    <Button
                      fullWidth
                      onClick={() => {
                        haptics.impactLight();
                        setInvestmentCategory(invCat);
                      }}
                      sx={{
                        borderRadius: '16px',
                        py: 1.2,
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        fontFamily: 'Space Grotesk',
                        backgroundColor: isSelected ? '#F1C40F' : 'rgba(255, 255, 255, 0.05)',
                        color: isSelected ? '#000000' : '#FFFFFF',
                        border: isSelected ? '1px solid #F39C12' : '1px solid rgba(255, 255, 255, 0.08)',
                        '&:active': { transform: 'scale(0.97)' },
                      }}
                    >
                      📈 {invCat}
                    </Button>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* 5. Transfer Recipient Name & Type Options (When Transfer Tab Active) */}
        {type === 'transfer' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#8A92A6', fontWeight: 700, fontFamily: 'Space Grotesk', mb: 1, display: 'block' }}>
              RECIPIENT TYPE & NAME
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1.5, overflowX: 'auto', pb: 0.5 }}>
              {TRANSFER_TYPES.map((t) => {
                const isSelected = transferType === t.type;
                const IconComponent = t.icon;
                return (
                  <Chip
                    key={t.type}
                    icon={<IconComponent size={14} color={isSelected ? '#FFF' : '#8A92A6'} />}
                    label={t.label}
                    onClick={() => {
                      haptics.impactLight();
                      setTransferType(t.type);
                    }}
                    sx={{
                      borderRadius: '12px',
                      backgroundColor: isSelected ? '#6C5CE7' : 'rgba(255, 255, 255, 0.06)',
                      color: isSelected ? '#FFFFFF' : '#8A92A6',
                      fontWeight: 700,
                      fontFamily: 'Space Grotesk',
                    }}
                  />
                );
              })}
            </Box>

            <TextField
              fullWidth
              size="small"
              label="Recipient Name"
              placeholder="e.g. Selma Knight / Mom / John"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              sx={{
                '& input': { color: '#FFF', fontWeight: 700, fontFamily: 'Space Grotesk' },
                '& label': { color: '#8A92A6' },
                '& .MuiOutlinedInput-root': { borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.04)' },
              }}
            />
          </Box>
        )}

        {/* Optional Extra Fields Drawer Toggle */}
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Button
            size="small"
            onClick={() => setShowMoreFields(!showMoreFields)}
            sx={{ color: '#8A92A6', fontSize: '0.78rem', textTransform: 'none' }}
          >
            {showMoreFields ? '▲ Hide Extra Details' : '▼ Add Note, Merchant & Custom Date'}
          </Button>

          <AnimatePresence>
            {showMoreFields && (
              <Box
                component={motion.div}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                sx={{ overflow: 'hidden', pt: 1, textAlign: 'left' }}
              >
                <TextField
                  fullWidth
                  size="small"
                  label="Note / Description"
                  placeholder="e.g. Dinner with team"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  sx={{ mb: 1.5, '& input': { color: '#FFF' }, '& label': { color: '#8A92A6' } }}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Merchant / Payee"
                  placeholder="e.g. Uber / Swiggy"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  sx={{ mb: 1.5, '& input': { color: '#FFF' }, '& label': { color: '#8A92A6' } }}
                />
                <TextField
                  type="datetime-local"
                  size="small"
                  fullWidth
                  value={date.substring(0, 16)}
                  onChange={(e) => setDate(new Date(e.target.value).toISOString())}
                  sx={{ '& input': { color: '#FFF' } }}
                />
              </Box>
            )}
          </AnimatePresence>
        </Box>

        {/* 6. Onscreen Dark Keypad Grid */}
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.2 }}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((key) => (
              <Button
                key={key}
                onClick={() => handleKeypadPress(key)}
                sx={keypadBtnStyle}
              >
                {key}
              </Button>
            ))}

            <Button
              onClick={() => handleKeypadPress('backspace')}
              sx={keypadBtnStyle}
            >
              <Delete size={20} color="#FFFFFF" />
            </Button>
          </Box>
        </Box>

        {/* 7. Bottom Main Action Button */}
        <Button
          fullWidth
          onClick={handleSubmit}
          sx={{
            py: 1.8,
            borderRadius: '28px',
            backgroundColor:
              type === 'expense'
                ? '#5B51D8'
                : type === 'income'
                ? '#00B894'
                : type === 'transfer'
                ? '#6C5CE7'
                : '#D4AC0D',
            color: type === 'investment' ? '#000000' : '#FFFFFF',
            fontWeight: 800,
            fontSize: '1.1rem',
            fontFamily: 'Space Grotesk',
            boxShadow: '0 10px 24px rgba(91, 81, 216, 0.4)',
            transition: 'transform 0.15s ease, background-color 0.15s ease',
            '&:active': { transform: 'scale(0.98)' },
          }}
        >
          {initialData
            ? 'Update Transaction'
            : type === 'expense'
            ? 'Save Expense'
            : type === 'income'
            ? 'Save Income'
            : type === 'transfer'
            ? `Send Money to ${recipientName || 'Friend'}`
            : `Save ${investmentCategory} Investment`}
        </Button>
      </Box>
    </Drawer>
  );
};

const keypadBtnStyle = {
  height: 54,
  borderRadius: '16px',
  backgroundColor: '#191C28',
  color: '#FFFFFF',
  fontSize: '1.4rem',
  fontWeight: 700,
  fontFamily: 'Space Grotesk',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  transition: 'transform 0.1s ease, background-color 0.1s ease',
  '&:active': {
    transform: 'scale(0.94)',
    backgroundColor: '#131620',
  },
};

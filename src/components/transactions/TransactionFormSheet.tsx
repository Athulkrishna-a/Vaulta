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
  Dialog,
  DialogContent,
  useTheme,
} from '@mui/material';
import { ArrowLeft, ChevronDown, ChevronUp, Delete, User, Users, Briefcase, RefreshCw, Check, Plus, Calculator, X, FileText, Calendar as CalendarIcon, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { App as CapacitorApp } from '@capacitor/app';
import { Transaction, TransactionType, PaymentMethod, TransferType, InvestmentCategory } from '../../types';
import { useAppData } from '../../app/providers/AppDataProvider';
import { CategoryIcon } from '../common/CategoryIcon';
import { useHaptics } from '../../hooks/useHaptics';
import { formatCurrency } from '../../utils/currency';
import { CustomDatePickerModal } from '../common/CustomDatePickerModal';
import { format } from 'date-fns';

interface TransactionFormSheetProps {
  open: boolean;
  onClose: () => void;
  initialData?: Transaction | null;
  defaultType?: TransactionType;
}

const TRANSFER_TYPES: { type: TransferType; label: string; icon: any }[] = [
  { type: 'Friend', label: 'Friend', icon: User },
  { type: 'Family', label: 'Family', icon: Users },
  { type: 'Business', label: 'Business', icon: Briefcase },
  { type: 'Self Account', label: 'Self Account', icon: RefreshCw },
];

export const TransactionFormSheet: React.FC<TransactionFormSheetProps> = ({
  open,
  onClose,
  initialData,
  defaultType,
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
  const [recipientName, setRecipientName] = useState<string>('');
  const [transferType, setTransferType] = useState<TransferType>('Friend');
  const [investmentCategory, setInvestmentCategory] = useState<string>('Mutual Funds');
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [date, setDate] = useState<string>(new Date().toISOString());
  const [note, setNote] = useState<string>('');
  const [showNoteInput, setShowNoteInput] = useState<boolean>(false);
  const [datePickerOpen, setDatePickerOpen] = useState<boolean>(false);

  // Calculator Popup State
  const [calcOpen, setCalcOpen] = useState<boolean>(false);
  const [calcDisplay, setCalcDisplay] = useState<string>('0');
  const [calcEquation, setCalcEquation] = useState<string>('');

  useEffect(() => {
    if (open) {
      if (initialData) {
        setType(initialData.type);
        setAmountStr(initialData.amount.toString());
        setCategoryId(initialData.categoryId || '');
        setAccountId(initialData.accountId || (accounts[0]?.id ?? ''));
        setDestinationAccountId(initialData.destinationAccountId || '');
        setRecipientName(initialData.recipientName || '');
        setTransferType(initialData.transferType || 'Friend');
        setInvestmentCategory((initialData.investmentCategory as InvestmentCategory) || 'Mutual Funds');
        setPaymentMethod(initialData.paymentMethod || 'UPI');
        setDate(initialData.date);
        setNote(initialData.note || '');
        setShowNoteInput(Boolean(initialData.note));
      } else {
        const targetType = defaultType || 'expense';
        setType(targetType);
        setAmountStr('0');
        const defaultCat = categories.find((c) => c.type === targetType || c.type === 'both');
        setCategoryId(defaultCat ? defaultCat.id : (categories[0]?.id ?? ''));
        setAccountId(accounts[0]?.id || '');
        setDestinationAccountId(accounts[1]?.id || '');
        setRecipientName('');
        setTransferType('Friend');
        setInvestmentCategory('Mutual Funds');
        setPaymentMethod('UPI');
        setDate(new Date().toISOString());
        setNote('');
        setShowNoteInput(false);
      }
    }
  }, [open, initialData, defaultType, categories, accounts]);

  // Handle mobile back gesture & Android hardware back button to close sheet
  useEffect(() => {
    if (!open) return;

    window.history.pushState({ formSheetOpen: true }, '');

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    let backListener: any = null;
    CapacitorApp.addListener('backButton', () => {
      onClose();
    }).then((h) => {
      backListener = h;
    });

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (backListener) {
        backListener.remove();
      }
    };
  }, [open, onClose]);

  const filteredCategories = categories.filter(
    (c) => c.type === type || c.type === 'both' || type === 'transfer'
  );

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

  // Popup Calculator Handlers
  const handleCalcNum = (digit: string) => {
    haptics.impactLight();
    if (calcDisplay === '0' && digit !== '.') {
      setCalcDisplay(digit);
    } else {
      if (digit === '.' && calcDisplay.includes('.')) return;
      if (calcDisplay.length >= 14) return;
      setCalcDisplay((prev) => prev + digit);
    }
  };

  const handleCalcOp = (op: string) => {
    haptics.impactLight();
    setCalcEquation(calcDisplay + ' ' + op + ' ');
    setCalcDisplay('0');
  };

  const handleCalcClear = () => {
    haptics.impactMedium();
    setCalcDisplay('0');
    setCalcEquation('');
  };

  const handleCalcBackspace = () => {
    haptics.impactLight();
    setCalcDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const handleCalcEvaluate = () => {
    haptics.impactHeavy();
    try {
      const fullEq = calcEquation + calcDisplay;
      const sanitized = fullEq.replace(/×/g, '*').replace(/÷/g, '/');
      const result = new Function(`return (${sanitized})`)();
      const formatted = typeof result === 'number' && !isNaN(result)
        ? parseFloat(result.toFixed(6)).toString()
        : 'Error';
      setCalcDisplay(formatted);
      setCalcEquation('');
    } catch (e) {
      setCalcDisplay('Error');
    }
  };

  const handleApplyCalcAmount = () => {
    if (calcDisplay !== 'Error' && calcDisplay !== '0') {
      setAmountStr(calcDisplay);
    }
    setCalcOpen(false);
  };

  const handleSubmit = async () => {
    const numAmount = parseFloat(amountStr);
    if (isNaN(numAmount) || numAmount <= 0) {
      haptics.notifyError();
      return;
    }

    if (type === 'transfer' && !recipientName.trim()) {
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

  // Active type theme color definitions
  const getTypeColors = (t: TransactionType) => {
    switch (t) {
      case 'expense':
        return {
          main: '#FF5252',
          light: 'rgba(255, 82, 82, 0.16)',
          border: 'rgba(255, 82, 82, 0.35)',
          glow: 'rgba(255, 82, 82, 0.4)',
          bgGradient: 'radial-gradient(ellipse 90% 45% at 50% 0%, rgba(255, 82, 82, 0.16) 0%, rgba(11, 14, 23, 0.98) 100%)',
          textColor: '#FFFFFF',
        };
      case 'income':
        return {
          main: '#00F5A0',
          light: 'rgba(0, 245, 160, 0.16)',
          border: 'rgba(0, 245, 160, 0.35)',
          glow: 'rgba(0, 245, 160, 0.4)',
          bgGradient: 'radial-gradient(ellipse 90% 45% at 50% 0%, rgba(0, 245, 160, 0.16) 0%, rgba(11, 14, 23, 0.98) 100%)',
          textColor: '#0B0E17',
        };
      case 'transfer':
        return {
          main: '#7C4DFF',
          light: 'rgba(124, 77, 255, 0.16)',
          border: 'rgba(124, 77, 255, 0.35)',
          glow: 'rgba(124, 77, 255, 0.4)',
          bgGradient: 'radial-gradient(ellipse 90% 45% at 50% 0%, rgba(124, 77, 255, 0.16) 0%, rgba(11, 14, 23, 0.98) 100%)',
          textColor: '#FFFFFF',
        };
      case 'investment':
        return {
          main: '#FFD600',
          light: 'rgba(255, 214, 0, 0.16)',
          border: 'rgba(255, 214, 0, 0.35)',
          glow: 'rgba(255, 214, 0, 0.4)',
          bgGradient: 'radial-gradient(ellipse 90% 45% at 50% 0%, rgba(255, 214, 0, 0.16) 0%, rgba(11, 14, 23, 0.98) 100%)',
          textColor: '#0B0E17',
        };
    }
  };

  const themeColors = getTypeColors(type);

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      transitionDuration={{ enter: 220, exit: 180 }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: '32px 32px 0 0',
            maxHeight: '94vh',
            background: themeColors.bgGradient,
            color: '#F4F6FC',
            px: 2.5,
            pt: 1.5,
            pb: 2.5,
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            borderTop: `1.5px solid ${themeColors.main}`,
            boxShadow: `0 -12px 40px ${themeColors.main}30`,
          },
        },
      }}
    >
      <Box sx={{ width: '100%' }}>

        {/* Header: Back Arrow & 4-Tab Segmented Selector */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <IconButton
            onClick={onClose}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#F4F6FC',
              width: 42,
              height: 42,
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '&:active': { transform: 'scale(0.92)' },
            }}
          >
            <ArrowLeft size={20} />
          </IconButton>

          <ToggleButtonGroup
            value={type}
            exclusive
            onChange={handleTypeChange}
            sx={{
              backgroundColor: 'rgba(18, 24, 38, 0.8)',
              p: 0.5,
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.4)',
              '& .MuiToggleButton-root': {
                border: 'none',
                borderRadius: '20px !important',
                fontWeight: 700,
                fontSize: '0.8rem',
                px: 2,
                py: 0.6,
                color: '#8A95AD',
                fontFamily: 'Space Grotesk',
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  backgroundColor: themeColors.main,
                  color: themeColors.textColor,
                  boxShadow: `0 4px 14px ${themeColors.main}50`,
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

        {/* 1. Large Amount Display */}
        <Box
          sx={{
            textAlign: 'center',
            py: 1.2,
            mb: 1,
            position: 'relative',
            borderRadius: '20px',
            background: 'rgba(18, 24, 38, 0.4)',
            border: `1px solid ${themeColors.main}20`,
            boxShadow: `inset 0 0 20px ${themeColors.main}10`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                fontFamily: 'Space Grotesk',
                color: '#F4F6FC',
                fontSize: '2.6rem',
                letterSpacing: '-0.02em',
                textShadow: `0 2px 10px ${themeColors.main}30`,
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
                width: 3.5,
                height: 40,
                backgroundColor: themeColors.main,
                borderRadius: '2px',
                ml: 0.5,
                boxShadow: `0 0 8px ${themeColors.main}`,
              }}
            />
          </Box>

          <Typography
            variant="caption"
            sx={{ color: '#8A95AD', fontWeight: 600, fontFamily: 'Space Grotesk', mt: 0.2, display: 'block' }}
          >
            Available Balance ({formatCurrency(totalBalance, settings.currency)})
          </Typography>
        </Box>

        {/* 2. Payment Method Selector */}
        <Box sx={{ mb: 1.5 }}>
          <Typography
            variant="caption"
            sx={{ color: '#8A95AD', fontWeight: 700, fontFamily: 'Space Grotesk', mb: 0.8, display: 'block' }}
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
                    borderRadius: '12px',
                    px: 1.5,
                    py: 0.3,
                    height: 30,
                    minHeight: 30,
                    fontWeight: 700,
                    fontSize: '0.74rem',
                    fontFamily: 'Space Grotesk',
                    backgroundColor: isSelected ? themeColors.light : 'rgba(255, 255, 255, 0.05)',
                    color: isSelected ? themeColors.main : '#8A95AD',
                    border: isSelected ? `1.5px solid ${themeColors.main}` : '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: isSelected ? `0 0 12px ${themeColors.main}30` : 'none',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                    '&:active': { transform: 'scale(0.96)' },
                  }}
                >
                  {pm}
                </Button>
              );
            })}
          </Box>
        </Box>

        {/* 3. Category Selector (2 items per row grid with icon & text in same row, swipeable) */}
        {(type === 'expense' || type === 'income') && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" sx={{ color: '#8A95AD', fontWeight: 700, fontFamily: 'Space Grotesk', mb: 0.8, display: 'block' }}>
              SELECT CATEGORY (SWIPE RIGHT →)
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateRows: 'repeat(2, auto)',
                gridAutoFlow: 'column',
                gridAutoColumns: 'calc((100% - 10px) / 2.15)',
                gap: 1,
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                pb: 0.5,
                WebkitOverflowScrolling: 'touch',
                '::-webkit-scrollbar': { display: 'none' },
              }}
            >
              {filteredCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <Box
                    key={cat.id}
                    onClick={() => {
                      haptics.impactLight();
                      setCategoryId(cat.id);
                    }}
                    sx={{
                      px: 1.2,
                      py: 0.4,
                      borderRadius: '14px',
                      backgroundColor: isSelected ? `${cat.color}25` : 'rgba(18, 24, 38, 0.75)',
                      color: isSelected ? cat.color : '#F4F6FC',
                      border: isSelected ? `1.5px solid ${cat.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: isSelected ? `0 0 14px ${cat.color}45` : 'none',
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      gap: 1,
                      height: 38,
                      scrollSnapAlign: 'start',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      '&:active': { transform: 'scale(0.96)' },
                    }}
                  >
                    <CategoryIcon
                      name={cat.icon}
                      size={14}
                      color={isSelected ? '#FFFFFF' : cat.color}
                      backgroundColor={isSelected ? cat.color : `${cat.color}22`}
                    />
                    <Typography variant="caption" noWrap sx={{ fontWeight: 700, fontFamily: 'Space Grotesk', fontSize: '0.78rem', flex: 1, minWidth: 0 }}>
                      {cat.name}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* 4. Investment Asset Selector (2 items per row grid with icon & text in same row, swipeable) */}
        {type === 'investment' && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" sx={{ color: '#8A95AD', fontWeight: 700, fontFamily: 'Space Grotesk', mb: 0.8, display: 'block' }}>
              SELECT INVESTMENT TYPE / ASSET (SWIPE RIGHT →)
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateRows: 'repeat(2, auto)',
                gridAutoFlow: 'column',
                gridAutoColumns: 'calc((100% - 10px) / 2.15)',
                gap: 1,
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                pb: 0.5,
                WebkitOverflowScrolling: 'touch',
                '::-webkit-scrollbar': { display: 'none' },
              }}
            >
              {investmentTypes.map((invCat) => {
                const isSelected = investmentCategory === invCat;
                return (
                  <Box
                    key={invCat}
                    onClick={() => {
                      haptics.impactLight();
                      setInvestmentCategory(invCat);
                    }}
                    sx={{
                      px: 1.2,
                      py: 0.4,
                      borderRadius: '14px',
                      backgroundColor: isSelected ? 'rgba(255, 214, 0, 0.2)' : 'rgba(18, 24, 38, 0.75)',
                      color: isSelected ? '#FFD600' : '#F4F6FC',
                      border: isSelected ? '1.5px solid #FFD600' : '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: isSelected ? '0 0 14px rgba(255, 214, 0, 0.4)' : 'none',
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      gap: 1,
                      height: 38,
                      scrollSnapAlign: 'start',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      '&:active': { transform: 'scale(0.96)' },
                    }}
                  >
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: '8px',
                        backgroundColor: isSelected ? '#FFD600' : 'rgba(255, 214, 0, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1 }}>📈</Typography>
                    </Box>
                    <Typography variant="caption" noWrap sx={{ fontWeight: 700, fontFamily: 'Space Grotesk', fontSize: '0.78rem', flex: 1, minWidth: 0 }}>
                      {invCat}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* 5. Transfer Recipient Name & Type Options */}
        {type === 'transfer' && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" sx={{ color: '#8A95AD', fontWeight: 700, fontFamily: 'Space Grotesk', mb: 0.8, display: 'block' }}>
              RECIPIENT TYPE & NAME
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1.2, overflowX: 'auto', pb: 0.5 }}>
              {TRANSFER_TYPES.map((t) => {
                const isSelected = transferType === t.type;
                const IconComponent = t.icon;
                return (
                  <Chip
                    key={t.type}
                    icon={<IconComponent size={14} color={isSelected ? '#FFF' : '#8A95AD'} />}
                    label={t.label}
                    onClick={() => {
                      haptics.impactLight();
                      setTransferType(t.type);
                    }}
                    sx={{
                      borderRadius: '12px',
                      backgroundColor: isSelected ? '#7C4DFF' : 'rgba(255, 255, 255, 0.06)',
                      color: isSelected ? '#FFFFFF' : '#8A95AD',
                      fontWeight: 700,
                      fontFamily: 'Space Grotesk',
                      boxShadow: isSelected ? '0 0 14px rgba(124, 77, 255, 0.4)' : 'none',
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
                '& input': { color: '#F4F6FC', fontWeight: 700, fontFamily: 'Space Grotesk' },
                '& label': { color: '#8A95AD' },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                  backgroundColor: 'rgba(18, 24, 38, 0.75)',
                  border: '1px solid rgba(124, 77, 255, 0.3)',
                },
              }}
            />
          </Box>
        )}
        {/* 6. Account Selection Strip (Debit Account) */}
        {accounts.length > 0 && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" sx={{ color: '#8A95AD', fontWeight: 700, fontFamily: 'Space Grotesk', mb: 0.8, display: 'block' }}>
              {type === 'income' ? 'DEPOSIT TO ACCOUNT' : type === 'investment' ? 'INVESTED FROM ACCOUNT' : type === 'transfer' ? 'FROM ACCOUNT (DEBIT)' : 'PAID FROM ACCOUNT'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5, '::-webkit-scrollbar': { display: 'none' } }}>
              {accounts.map((acc) => {
                const isSelected = (accountId || accounts[0]?.id) === acc.id;
                return (
                  <Chip
                    key={acc.id}
                    icon={<Wallet size={14} color={isSelected ? '#031C0C' : '#8A95AD'} />}
                    label={acc.name}
                    onClick={() => {
                      haptics.impactLight();
                      setAccountId(acc.id);
                    }}
                    sx={{
                      borderRadius: '12px',
                      backgroundColor: isSelected ? themeColors.main : 'rgba(255, 255, 255, 0.06)',
                      color: isSelected ? (type === 'expense' ? '#FFF' : '#031C0C') : '#F4F6FC',
                      fontWeight: 800,
                      fontFamily: 'Space Grotesk',
                      border: isSelected ? `1.5px solid ${themeColors.main}` : '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        )}

        {/* 6. Collapsible Optional Note / Description Section & Small Square Calendar Button */}
        <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ flex: 1 }}>
            {!showNoteInput ? (
              <Button
                size="small"
                fullWidth
                onClick={() => {
                  haptics.impactLight();
                  setShowNoteInput(true);
                }}
                startIcon={<FileText size={14} />}
                endIcon={<ChevronDown size={14} />}
                sx={{
                  color: '#8A95AD',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: '14px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontFamily: 'Space Grotesk',
                  fontSize: '0.78rem',
                  py: 0.8,
                  px: 2,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#F4F6FC' },
                }}
              >
                + Add Note / Description (Optional)
              </Button>
            ) : (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#8A95AD', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                    DESCRIPTION / NOTE
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => {
                      haptics.impactLight();
                      setShowNoteInput(false);
                    }}
                    sx={{ color: '#8A95AD', p: 0.2 }}
                  >
                    <ChevronUp size={16} />
                  </IconButton>
                </Box>
                <TextField
                  fullWidth
                  size="small"
                  autoFocus
                  placeholder="Add note or description (e.g. Lunch with team)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  sx={{
                    '& input': { color: '#F4F6FC', fontWeight: 600, fontFamily: 'Space Grotesk' },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '14px',
                      backgroundColor: 'rgba(18, 24, 38, 0.75)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      '&:hover': { border: `1px solid ${themeColors.main}50` },
                      '&.Mui-focused': { border: `1.5px solid ${themeColors.main}` },
                    },
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Small Square Calendar Date Picker Icon Button (Optional Date Selector) */}
          <IconButton
            onClick={() => setDatePickerOpen(true)}
            title="Choose Transaction Date"
            sx={{
              width: 42,
              height: 42,
              borderRadius: '14px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: `1.5px solid ${themeColors.main}60`,
              color: themeColors.main,
              boxShadow: `0 4px 12px ${themeColors.main}20`,
              flexShrink: 0,
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.12)' },
              '&:active': { transform: 'scale(0.92)' },
            }}
          >
            <CalendarIcon size={20} />
          </IconButton>
        </Box>

        {/* Selected Date Preview Indicator */}
        <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 0.5 }}>
          <Typography variant="caption" sx={{ color: '#8A95AD', fontWeight: 600, fontSize: '0.72rem' }}>
            Date: <strong style={{ color: themeColors.main }}>{format(new Date(date), 'dd MMM yyyy, hh:mm a')}</strong>
          </Typography>
        </Box>

        {/* 7. Onscreen Dark Keypad Grid */}
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
              <Delete size={20} color="#F4F6FC" />
            </Button>
          </Box>
        </Box>

        {/* 8. Bottom Action Bar: Main Save Button + Popup Calculator Icon */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
          <Button
            fullWidth
            onClick={handleSubmit}
            disabled={type === 'transfer' && !recipientName.trim()}
            sx={{
              py: 1.8,
              borderRadius: '24px',
              backgroundColor: themeColors.main,
              color: themeColors.textColor,
              fontWeight: 800,
              fontSize: '1.1rem',
              fontFamily: 'Space Grotesk',
              boxShadow: `0 10px 28px ${themeColors.main}50`,
              transition: 'transform 0.15s ease, background-color 0.15s ease',
              '&:active': { transform: 'scale(0.98)' },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                color: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            {initialData
              ? 'Update Transaction'
              : type === 'expense'
              ? 'Save Expense'
              : type === 'income'
              ? 'Save Income'
              : type === 'transfer'
              ? `Send Money`
              : `Save Investment`}
          </Button>

          <IconButton
            onClick={() => {
              haptics.impactLight();
              setCalcDisplay(amountStr !== '0' ? amountStr : '0');
              setCalcEquation('');
              setCalcOpen(true);
            }}
            title="Open Calculator"
            sx={{
              width: 56,
              height: 56,
              flexShrink: 0,
              borderRadius: '20px',
              backgroundColor: themeColors.light,
              color: themeColors.main,
              border: `1.5px solid ${themeColors.main}40`,
              boxShadow: `0 6px 18px ${themeColors.main}25`,
              '&:hover': { backgroundColor: themeColors.light },
              '&:active': { transform: 'scale(0.94)' },
            }}
          >
            <Calculator size={24} />
          </IconButton>
        </Box>
      </Box>

      {/* Custom Date Picker Modal */}
      <CustomDatePickerModal
        open={datePickerOpen}
        onClose={() => setDatePickerOpen(false)}
        startDate={date.substring(0, 10)}
        onApply={(startDate) => {
          if (startDate) {
            const pickedDate = new Date(startDate);
            const now = new Date();
            pickedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
            setDate(pickedDate.toISOString());
          }
        }}
      />

      {/* Calculator Popup Dialog */}
      <Dialog
        open={calcOpen}
        onClose={() => setCalcOpen(false)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '28px',
              backgroundColor: '#0F1420',
              color: '#F4F6FC',
              p: 2.5,
              width: '90%',
              maxWidth: 360,
              border: `1.5px solid ${themeColors.main}40`,
              boxShadow: `0 20px 50px rgba(0, 0, 0, 0.8), 0 0 20px ${themeColors.main}20`,
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk', color: themeColors.main }}>
            Quick Calculator
          </Typography>
          <IconButton onClick={() => setCalcOpen(false)} sx={{ color: '#8A95AD' }}>
            <X size={20} />
          </IconButton>
        </Box>

        {/* LCD Screen Display */}
        <Box
          sx={{
            borderRadius: '20px',
            p: 2,
            backgroundColor: '#8FA667',
            color: '#152409',
            boxShadow: 'inset 0 3px 10px rgba(0, 0, 0, 0.4)',
            border: '3px solid #1E2333',
            mb: 2,
            minHeight: 85,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="caption" sx={{ textAlign: 'right', fontWeight: 800, color: '#2A3C17' }}>
            {calcEquation || 'Ready'}
          </Typography>
          <Typography variant="h4" sx={{ textAlign: 'right', fontWeight: 900, fontFamily: 'Space Grotesk, monospace', color: '#152409' }}>
            {calcDisplay}
          </Typography>
        </Box>

        {/* Keypad Grid */}
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid size={{ xs: 3 }}>
            <Button fullWidth onClick={handleCalcClear} sx={calcModalBtn('#FF5252')}>C</Button>
          </Grid>
          <Grid size={{ xs: 3 }}>
            <Button fullWidth onClick={handleCalcBackspace} sx={calcModalBtn('#FF7675')}>⌫</Button>
          </Grid>
          <Grid size={{ xs: 3 }}>
            <Button fullWidth onClick={() => handleCalcOp('÷')} sx={calcModalBtn(themeColors.main)}>÷</Button>
          </Grid>
          <Grid size={{ xs: 3 }}>
            <Button fullWidth onClick={() => handleCalcOp('×')} sx={calcModalBtn(themeColors.main)}>×</Button>
          </Grid>

          <Grid size={{ xs: 3 }}>
            <Button fullWidth onClick={() => handleCalcNum('7')} sx={calcModalNum}>7</Button>
          </Grid>
          <Grid size={{ xs: 3 }}>
            <Button fullWidth onClick={() => handleCalcNum('8')} sx={calcModalNum}>8</Button>
          </Grid>
          <Grid size={{ xs: 3 }}>
            <Button fullWidth onClick={() => handleCalcNum('9')} sx={calcModalNum}>9</Button>
          </Grid>
          <Grid size={{ xs: 3 }}>
            <Button fullWidth onClick={() => handleCalcOp('-')} sx={calcModalBtn(themeColors.main)}>-</Button>
          </Grid>

          <Grid size={{ xs: 3 }}>
            <Button fullWidth onClick={() => handleCalcNum('4')} sx={calcModalNum}>4</Button>
          </Grid>
          <Grid size={{ xs: 3 }}>
            <Button fullWidth onClick={() => handleCalcNum('5')} sx={calcModalNum}>5</Button>
          </Grid>
          <Grid size={{ xs: 3 }}>
            <Button fullWidth onClick={() => handleCalcNum('6')} sx={calcModalNum}>6</Button>
          </Grid>
          <Grid size={{ xs: 3 }}>
            <Button fullWidth onClick={() => handleCalcOp('+')} sx={calcModalBtn(themeColors.main)}>+</Button>
          </Grid>

          <Grid size={{ xs: 3 }}>
            <Button fullWidth onClick={() => handleCalcNum('1')} sx={calcModalNum}>1</Button>
          </Grid>
          <Grid size={{ xs: 3 }}>
            <Button fullWidth onClick={() => handleCalcNum('2')} sx={calcModalNum}>2</Button>
          </Grid>
          <Grid size={{ xs: 3 }}>
            <Button fullWidth onClick={() => handleCalcNum('3')} sx={calcModalNum}>3</Button>
          </Grid>
          <Grid size={{ xs: 3 }}>
            <Button fullWidth onClick={handleCalcEvaluate} sx={calcModalBtn(themeColors.main, themeColors.main)}>=</Button>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Button fullWidth onClick={() => handleCalcNum('0')} sx={calcModalNum}>0</Button>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Button fullWidth onClick={() => handleCalcNum('.')} sx={calcModalNum}>.</Button>
          </Grid>
        </Grid>

        <Button
          fullWidth
          onClick={handleApplyCalcAmount}
          sx={{
            py: 1.2,
            borderRadius: '16px',
            backgroundColor: themeColors.main,
            color: themeColors.textColor,
            fontWeight: 800,
            fontFamily: 'Space Grotesk',
            fontSize: '0.95rem',
            boxShadow: `0 4px 16px ${themeColors.main}40`,
            '&:active': { transform: 'scale(0.97)' },
          }}
        >
          Apply to Amount ({calcDisplay})
        </Button>
      </Dialog>
    </Drawer>
  );
};

const keypadBtnStyle = {
  height: 52,
  borderRadius: '16px',
  backgroundColor: 'rgba(22, 27, 40, 0.85)',
  color: '#F4F6FC',
  fontSize: '1.4rem',
  fontWeight: 700,
  fontFamily: 'Space Grotesk',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  transition: 'all 0.12s ease',
  '&:active': {
    transform: 'scale(0.94)',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
};

const calcModalNum = {
  height: 46,
  borderRadius: '14px',
  fontSize: '1.2rem',
  fontWeight: 700,
  fontFamily: 'Space Grotesk',
  color: '#F4F6FC',
  backgroundColor: '#182030',
  border: '1px solid rgba(255,255,255,0.06)',
};

const calcModalBtn = (color: string, bgColor?: string) => ({
  height: 46,
  borderRadius: '14px',
  fontSize: '1.1rem',
  fontWeight: 800,
  fontFamily: 'Space Grotesk',
  color: bgColor ? '#0B0E17' : color,
  backgroundColor: bgColor || '#182030',
  border: '1px solid rgba(255,255,255,0.06)',
});

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  useTheme,
  IconButton,
  Chip,
  Tabs,
  Tab,
  Paper,
  Divider,
} from '@mui/material';
import {
  Plus,
  Wallet,
  Edit2,
  ChevronLeft,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Landmark,
  DollarSign,
  Smartphone,
  Settings as SettingsIcon,
  Building2,
  PieChart as PieIcon,
  Receipt,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Account, AccountType } from '../types';
import { useAppData } from '../app/providers/AppDataProvider';
import { GlassCard } from '../components/common/GlassCard';
import { CurrencyText } from '../components/common/CurrencyText';
import { calculateAccountBalances } from '../utils/calculations';
import { useHaptics } from '../hooks/useHaptics';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const BANK_PRESETS = [
  { name: 'State Bank of India', shortName: 'SBI', type: 'bank' as AccountType, color: '#1B4F72', icon: Landmark },
  { name: 'HDFC Bank', shortName: 'HDFC', type: 'bank' as AccountType, color: '#004B87', icon: Landmark },
  { name: 'ICICI Bank', shortName: 'ICICI', type: 'bank' as AccountType, color: '#F37021', icon: Landmark },
  { name: 'Axis Bank', shortName: 'Axis', type: 'bank' as AccountType, color: '#97123A', icon: Landmark },
  { name: 'Kotak Mahindra', shortName: 'Kotak', type: 'bank' as AccountType, color: '#ED1C24', icon: Landmark },
  { name: 'Punjab National Bank', shortName: 'PNB', type: 'bank' as AccountType, color: '#A20638', icon: Landmark },
  { name: 'Google Pay / UPI', shortName: 'GPay', type: 'upi' as AccountType, color: '#4285F4', icon: Smartphone },
  { name: 'PhonePe UPI', shortName: 'PhonePe', type: 'upi' as AccountType, color: '#5F259F', icon: Smartphone },
  { name: 'Cash Wallet', shortName: 'Cash', type: 'cash' as AccountType, color: '#2ECC71', icon: DollarSign },
  { name: 'HDFC Credit Card', shortName: 'HDFC Card', type: 'credit_card' as AccountType, color: '#E74C3C', icon: CreditCard },
  { name: 'SBI Credit Card', shortName: 'SBI Card', type: 'credit_card' as AccountType, color: '#C0392B', icon: CreditCard },
];

const ACCOUNT_TYPE_ICONS: Record<AccountType, any> = {
  bank: Landmark,
  upi: Smartphone,
  cash: DollarSign,
  credit_card: CreditCard,
  wallet: Wallet,
  other: Wallet,
};

const ACCOUNT_COLORS: Record<string, string> = {
  bank: '#3498DB',
  upi: '#9B59B6',
  cash: '#2ECC71',
  credit_card: '#E74C3C',
  wallet: '#F1C40F',
  other: '#1ABC9C',
};

export const AccountsPage: React.FC = () => {
  const theme = useTheme();
  const haptics = useHaptics();
  const navigate = useNavigate();
  const { accounts, transactions, addAccount, updateAccount, settings } = useAppData();

  const [activeTab, setActiveTab] = useState<'bank' | 'credit_card'>('bank');
  const [activeDeckIndex, setActiveDeckIndex] = useState<number>(0);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const [name, setName] = useState<string>('');
  const [type, setType] = useState<AccountType>('bank');
  const [initialBalance, setInitialBalance] = useState<string>('0');
  const [selectedColor, setSelectedColor] = useState<string>('#3498DB');

  const balances = calculateAccountBalances(accounts, transactions);

  // Filter accounts based on tab ('bank' vs 'credit_card')
  const filteredAccounts = accounts.filter((acc) =>
    activeTab === 'credit_card' ? acc.type === 'credit_card' : acc.type !== 'credit_card'
  );

  const totalDeckCount = filteredAccounts.length + 1;
  const safeDeckIndex = activeDeckIndex >= totalDeckCount ? 0 : activeDeckIndex;

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setName('');
    setType(activeTab === 'credit_card' ? 'credit_card' : 'bank');
    setInitialBalance('0');
    setSelectedColor(activeTab === 'credit_card' ? '#E74C3C' : '#3498DB');
    setDialogOpen(true);
  };

  const handleOpenEdit = (acc: Account) => {
    setEditingAccount(acc);
    setName(acc.name);
    setType(acc.type);
    setInitialBalance(acc.initialBalance.toString());
    setSelectedColor(acc.color || ACCOUNT_COLORS[acc.type] || '#3498DB');
    setDialogOpen(true);
  };

  const handleSelectPreset = (preset: typeof BANK_PRESETS[0]) => {
    haptics.impactLight();
    setName(preset.name);
    setType(preset.type);
    setSelectedColor(preset.color);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    haptics.impactMedium();
    const numInitial = parseFloat(initialBalance) || 0;

    if (editingAccount) {
      await updateAccount({
        ...editingAccount,
        name: name.trim(),
        type,
        initialBalance: numInitial,
        color: selectedColor,
      });
    } else {
      await addAccount({
        name: name.trim(),
        type,
        initialBalance: numInitial,
        currency: settings.currency,
        color: selectedColor,
        icon: 'Wallet',
      });
    }
    setDialogOpen(false);
  };

  // Compute stats for accounts in current view
  const overallBalance = filteredAccounts.reduce((sum, acc) => sum + (balances.get(acc.id) || 0), 0);

  const getAccountStats = (accId?: string) => {
    let income = 0;
    let expense = 0;
    const targetAccounts = accId ? [accId] : filteredAccounts.map((a) => a.id);

    transactions.forEach((t) => {
      if (targetAccounts.includes(t.accountId || '')) {
        if (t.type === 'income') income += t.amount;
        if (t.type === 'expense') expense += t.amount;
        if (t.type === 'transfer') expense += t.amount;
      }
      if (targetAccounts.includes(t.destinationAccountId || '')) {
        if (t.type === 'transfer') income += t.amount;
      }
    });

    return { income, expense };
  };

  const currentDeckAccount = safeDeckIndex > 0 ? filteredAccounts[safeDeckIndex - 1] : null;
  const currentDeckBalance = currentDeckAccount ? (balances.get(currentDeckAccount.id) || 0) : overallBalance;
  const currentDeckStats = getAccountStats(currentDeckAccount?.id);

  // Pie chart breakdown data for filtered accounts
  const pieChartData = filteredAccounts
    .map((acc) => ({
      name: acc.name,
      value: Math.max(0, balances.get(acc.id) || 0),
      color: acc.color || ACCOUNT_COLORS[acc.type] || '#3498DB',
    }))
    .filter((d) => d.value > 0);

  const activeAccountTx = transactions.filter((t) => {
    if (currentDeckAccount) {
      return t.accountId === currentDeckAccount.id || t.destinationAccountId === currentDeckAccount.id;
    }
    return filteredAccounts.some((a) => a.id === t.accountId || a.id === t.destinationAccountId);
  }).slice(0, 5);

  return (
    <Box sx={{ p: 2, pt: 'calc(env(safe-area-inset-top, 0px) + 20px)', pb: 12, maxWidth: 600, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk' }}>
          Accounts & Cards
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={() => navigate('/settings')}
            sx={{
              width: 42,
              height: 42,
              borderRadius: '14px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              color: '#8A95AD',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            title="Settings"
          >
            <SettingsIcon size={20} />
          </IconButton>

          <IconButton
            onClick={handleOpenAdd}
            sx={{
              width: 42,
              height: 42,
              borderRadius: '14px',
              backgroundColor: '#00F5A0',
              color: '#031C0C',
              boxShadow: '0 4px 14px rgba(0, 245, 160, 0.4)',
              '&:hover': { backgroundColor: '#00D68B' },
              '&:active': { transform: 'scale(0.94)' },
            }}
            title="Add Account"
          >
            <Plus size={22} strokeWidth={2.8} />
          </IconButton>
        </Box>
      </Box>

      {/* 2 Segmented Tabs: Bank Accounts vs Credit Cards */}
      <Box sx={{ mb: 2.5 }}>
        <Tabs
          value={activeTab}
          onChange={(_e, val) => {
            haptics.impactLight();
            setActiveTab(val);
            setActiveDeckIndex(0);
          }}
          variant="fullWidth"
          sx={{
            backgroundColor: 'rgba(18, 24, 38, 0.75)',
            p: 0.3,
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            minHeight: 38,
            height: 38,
            '& .MuiTabs-indicator': { display: 'none' },
            '& .MuiTab-root': {
              borderRadius: '12px',
              fontWeight: 800,
              fontFamily: 'Space Grotesk',
              fontSize: '0.8rem',
              color: '#8A95AD',
              textTransform: 'none',
              minHeight: 32,
              height: 32,
              py: 0.2,
              px: 1.5,
              transition: 'all 0.2s ease',
              '&.Mui-selected': {
                backgroundColor: activeTab === 'credit_card' ? '#E74C3C' : '#00F5A0',
                color: activeTab === 'credit_card' ? '#FFFFFF' : '#031C0C',
                boxShadow: activeTab === 'credit_card' ? '0 4px 14px rgba(231, 76, 60, 0.4)' : '0 4px 14px rgba(0, 245, 160, 0.4)',
              },
            },
          }}
        >
          <Tab icon={<Building2 size={15} />} iconPosition="start" label="Bank & Wallets" value="bank" />
          <Tab icon={<CreditCard size={15} />} iconPosition="start" label="Credit Cards" value="credit_card" />
        </Tabs>
      </Box>

      {/* TOP SWIPEABLE ACCOUNT BALANCE DECK (ONLY EDIT ICON, NO ADJUST TEXT) */}
      <Box sx={{ mb: 3 }}>
        {/* Deck Header & Pagination Indicators */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 0.5, mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Layers size={16} color={activeTab === 'credit_card' ? '#E74C3C' : theme.palette.primary.main} />
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.72rem' }}>
              {safeDeckIndex === 0
                ? `1 of ${totalDeckCount} • ${activeTab === 'credit_card' ? 'Total Credit Cards' : 'Total Bank Balance'}`
                : `${safeDeckIndex + 1} of ${totalDeckCount} • ${currentDeckAccount?.name}`}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 0.6 }}>
            {Array.from({ length: totalDeckCount }).map((_, idx) => (
              <Box
                key={idx}
                onClick={() => {
                  haptics.impactLight();
                  setActiveDeckIndex(idx);
                }}
                sx={{
                  width: safeDeckIndex === idx ? 16 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: safeDeckIndex === idx ? (activeTab === 'credit_card' ? '#E74C3C' : '#00F5A0') : theme.palette.action.disabled,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Swipeable Card Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}_${safeDeckIndex}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              haptics.impactLight();
              setActiveDeckIndex((prev) => (prev + 1) % totalDeckCount);
            }}
            style={{ cursor: 'pointer' }}
          >
            <GlassCard
              sx={{
                p: 3,
                borderRadius: '28px',
                background: currentDeckAccount
                  ? `radial-gradient(ellipse 90% 80% at 90% 10%, ${currentDeckAccount.color || ACCOUNT_COLORS[currentDeckAccount.type] || '#3498DB'}35 0%, rgba(15, 20, 32, 0.98) 100%)`
                  : activeTab === 'credit_card'
                  ? 'radial-gradient(ellipse 90% 80% at 90% 10%, rgba(231, 76, 60, 0.25) 0%, rgba(15, 20, 32, 0.98) 100%)'
                  : 'radial-gradient(ellipse 90% 80% at 90% 10%, rgba(0, 245, 160, 0.25) 0%, rgba(15, 20, 32, 0.98) 100%)',
                border: currentDeckAccount
                  ? `1.5px solid ${currentDeckAccount.color || ACCOUNT_COLORS[currentDeckAccount.type] || '#3498DB'}50`
                  : activeTab === 'credit_card'
                  ? '1.5px solid rgba(231, 76, 60, 0.4)'
                  : '1.5px solid rgba(0, 245, 160, 0.4)',
                boxShadow: currentDeckAccount
                  ? `0 12px 35px ${currentDeckAccount.color || ACCOUNT_COLORS[currentDeckAccount.type] || '#3498DB'}25`
                  : '0 12px 35px rgba(0, 245, 160, 0.2)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '16px',
                      backgroundColor: currentDeckAccount
                        ? `${currentDeckAccount.color || ACCOUNT_COLORS[currentDeckAccount.type] || '#3498DB'}25`
                        : activeTab === 'credit_card'
                        ? 'rgba(231, 76, 60, 0.2)'
                        : 'rgba(0, 245, 160, 0.2)',
                      color: currentDeckAccount
                        ? currentDeckAccount.color || ACCOUNT_COLORS[currentDeckAccount.type] || '#3498DB'
                        : activeTab === 'credit_card'
                        ? '#E74C3C'
                        : '#00F5A0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {currentDeckAccount ? (
                      React.createElement(ACCOUNT_TYPE_ICONS[currentDeckAccount.type] || Wallet, { size: 22 })
                    ) : activeTab === 'credit_card' ? (
                      <CreditCard size={22} />
                    ) : (
                      <Wallet size={22} />
                    )}
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk' }}>
                      {currentDeckAccount ? currentDeckAccount.name : activeTab === 'credit_card' ? 'All Credit Cards' : 'All Bank Accounts'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'capitalize' }}>
                      {currentDeckAccount ? `${currentDeckAccount.type.replace('_', ' ')} Account` : 'Swipe right → for each card analysis'}
                    </Typography>
                  </Box>
                </Box>

                {/* EDIT ICON ONLY (NO ADJUST TEXT) */}
                {currentDeckAccount && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(currentDeckAccount);
                    }}
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      color: '#F4F6FC',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    }}
                  >
                    <Edit2 size={16} />
                  </IconButton>
                )}
              </Box>

              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700, letterSpacing: '0.04em' }}>
                CURRENT COMPUTED BALANCE
              </Typography>
              <CurrencyText
                amount={currentDeckBalance}
                sx={{
                  fontSize: '2.1rem',
                  fontWeight: 800,
                  fontFamily: 'Space Grotesk',
                  display: 'block',
                  color: currentDeckBalance >= 0 ? (activeTab === 'credit_card' ? '#FF5252' : '#00F5A0') : '#FF5252',
                  mb: 2,
                }}
              />

              <Grid container spacing={2} sx={{ pt: 1, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <Grid size={{ xs: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ArrowUpRight size={18} color="#00F5A0" />
                    <Box>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', fontSize: '0.7rem' }}>
                        Total Income / Credits
                      </Typography>
                      <CurrencyText amount={currentDeckStats.income} sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#00F5A0' }} />
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ArrowDownRight size={18} color="#FF5252" />
                    <Box>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', fontSize: '0.7rem' }}>
                        Total Expenses / Debits
                      </Typography>
                      <CurrencyText amount={currentDeckStats.expense} sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#FF5252' }} />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* CIRCULAR GRAPH ANALYSIS (PIE/DONUT CHART OF ACCOUNT BALANCES) */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: '28px',
          background: theme.palette.background.glass,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${theme.palette.background.glassBorder}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <PieIcon size={18} color={activeTab === 'credit_card' ? '#E74C3C' : '#00F5A0'} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk' }}>
            {activeTab === 'credit_card' ? 'Credit Cards Share Analysis' : 'Bank Balance Share Analysis'}
          </Typography>
        </Box>

        {pieChartData.length > 0 ? (
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ height: 180, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#0F1420',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '12px',
                        color: '#FFF',
                      }}
                      formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Balance']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {pieChartData.map((item) => {
                  const pct = overallBalance > 0 ? Math.round((item.value / overallBalance) * 100) : 0;
                  return (
                    <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: item.color }} />
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                          {item.name}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk', color: '#00F5A0' }}>
                        ₹{item.value.toLocaleString()} ({pct}%)
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: 'center', py: 2 }}>
            No balance data available to show circular chart.
          </Typography>
        )}
      </Paper>

      {/* ACCOUNT DETAILS & INSIGHTS */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk', mb: 1.5 }}>
          {currentDeckAccount ? `${currentDeckAccount.name} Insights & History` : 'Account Overview'}
        </Typography>

        {activeAccountTx.length > 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '24px',
              background: theme.palette.background.glass,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.palette.background.glassBorder}`,
            }}
          >
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700, mb: 1.5, display: 'block' }}>
              RECENT TRANSACTIONS FOR THIS ACCOUNT
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              {activeAccountTx.map((tx) => (
                <Box
                  key={tx.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.2,
                    borderRadius: '14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        backgroundColor: tx.type === 'income' ? 'rgba(0, 245, 160, 0.15)' : 'rgba(255, 82, 82, 0.15)',
                        color: tx.type === 'income' ? '#00F5A0' : '#FF5252',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {tx.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                        {tx.note || tx.recipientName || tx.type}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {format(new Date(tx.date), 'dd MMM yyyy')}
                      </Typography>
                    </Box>
                  </Box>

                  <CurrencyText
                    amount={tx.amount}
                    sx={{
                      fontWeight: 800,
                      fontFamily: 'Space Grotesk',
                      color: tx.type === 'income' ? '#00F5A0' : '#FF5252',
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              textAlign: 'center',
              borderRadius: '24px',
              background: theme.palette.background.glass,
              border: `1px solid ${theme.palette.background.glassBorder}`,
            }}
          >
            <Receipt size={32} color={theme.palette.text.secondary} style={{ opacity: 0.6 }} />
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
              No recent transactions linked to this account card.
            </Typography>
          </Paper>
        )}
      </Box>

      {/* ALL FILTERED ACCOUNTS GRID WITH REDESIGNED SLEEK CARD DESIGN */}
      <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk', mb: 1.5 }}>
        All {activeTab === 'credit_card' ? 'Credit Cards' : 'Bank Accounts & Wallets'} ({filteredAccounts.length})
      </Typography>

      <Grid container spacing={2}>
        {filteredAccounts.map((acc, index) => {
          const currentBal = balances.get(acc.id) || 0;
          const IconComp = ACCOUNT_TYPE_ICONS[acc.type] || Wallet;
          const accColor = acc.color || ACCOUNT_COLORS[acc.type] || '#3498DB';
          return (
            <Grid key={acc.id} size={{ xs: 12, sm: 6 }}>
              <GlassCard
                onClick={() => {
                  haptics.impactLight();
                  setActiveDeckIndex(index + 1);
                }}
                sx={{
                  p: 2.2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  border: safeDeckIndex === index + 1 ? `1.5px solid ${accColor}` : '1px solid rgba(255, 255, 255, 0.08)',
                  background: `linear-gradient(135deg, ${accColor}12 0%, rgba(15, 20, 32, 0.95) 100%)`,
                  borderRadius: '24px',
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-2px)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '14px',
                      backgroundColor: `${accColor}22`,
                      color: accColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 12px ${accColor}30`,
                    }}
                  >
                    <IconComp size={22} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk' }}>
                      {acc.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'capitalize' }}>
                      {acc.type.replace('_', ' ')}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box>
                    <CurrencyText amount={currentBal} sx={{ fontSize: '1.1rem', fontWeight: 800, display: 'block' }} />
                  </Box>

                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(acc);
                    }}
                    sx={{ color: theme.palette.text.secondary, p: 0.5 }}
                  >
                    <Edit2 size={16} />
                  </IconButton>
                </Box>
              </GlassCard>
            </Grid>
          );
        })}
      </Grid>

      {/* Add/Edit Account Dialog ("Save" button text only) */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: {
              borderRadius: '28px',
              p: 1.5,
              background: 'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(0, 245, 160, 0.22) 0%, rgba(15, 20, 32, 0.98) 100%)',
              color: '#F4F6FC',
              border: '1.5px solid rgba(0, 245, 160, 0.4)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 245, 160, 0.25)',
              backdropFilter: 'blur(30px)',
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontFamily: 'Space Grotesk', fontSize: '1.25rem', color: '#00F5A0' }}>
          {editingAccount ? 'Edit Account Details' : 'Add New Account'}
        </DialogTitle>
        <DialogContent>
          {!editingAccount && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#8A95AD', fontWeight: 700, fontFamily: 'Space Grotesk', mb: 1, display: 'block' }}>
                SELECT POPULAR PRESET
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, '::-webkit-scrollbar': { display: 'none' } }}>
                {BANK_PRESETS.map((preset) => {
                  const IconComponent = preset.icon;
                  return (
                    <Chip
                      key={preset.name}
                      icon={<IconComponent size={14} color="#FFF" />}
                      label={preset.shortName}
                      onClick={() => handleSelectPreset(preset)}
                      sx={{
                        borderRadius: '12px',
                        backgroundColor: preset.color,
                        color: '#FFF',
                        fontWeight: 800,
                        fontFamily: 'Space Grotesk',
                        border: name === preset.name ? '2px solid #FFF' : 'none',
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          )}

          <TextField
            fullWidth
            label="Account Name"
            placeholder="e.g. SBI Savings / HDFC Credit Card"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{
              mb: 2,
              '& label': { color: '#8A95AD', fontWeight: 600 },
              '& label.MuiInputLabel-shrink': {
                backgroundColor: '#0F1420',
                px: 0.8,
                borderRadius: '4px',
                zIndex: 1,
              },
              '& input': { color: '#F4F6FC', fontWeight: 700, fontFamily: 'Space Grotesk' },
              '& .MuiOutlinedInput-root': {
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#00F5A0',
                  borderWidth: '1.5px',
                },
              },
            }}
          />

          <TextField
            fullWidth
            select
            label="Account Type"
            value={type}
            onChange={(e) => setType(e.target.value as AccountType)}
            sx={{
              mb: 2,
              '& label': { color: '#8A95AD', fontWeight: 600 },
              '& label.MuiInputLabel-shrink': {
                backgroundColor: '#0F1420',
                px: 0.8,
                borderRadius: '4px',
                zIndex: 1,
              },
              '& .MuiSelect-select': { color: '#F4F6FC', fontWeight: 700, fontFamily: 'Space Grotesk' },
              '& .MuiOutlinedInput-root': {
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#00F5A0',
                  borderWidth: '1.5px',
                },
              },
            }}
          >
            <MenuItem value="bank">Bank Account</MenuItem>
            <MenuItem value="upi">UPI / GPay / PhonePe</MenuItem>
            <MenuItem value="cash">Cash</MenuItem>
            <MenuItem value="credit_card">Credit Card</MenuItem>
            <MenuItem value="wallet">Digital Wallet</MenuItem>
            <MenuItem value="other">Other Account</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="Initial Starting Balance"
            type="number"
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
            sx={{
              mb: 1,
              '& label': { color: '#8A95AD', fontWeight: 600 },
              '& label.MuiInputLabel-shrink': {
                backgroundColor: '#0F1420',
                px: 0.8,
                borderRadius: '4px',
                zIndex: 1,
              },
              '& input': { color: '#F4F6FC', fontWeight: 700, fontFamily: 'Space Grotesk' },
              '& .MuiOutlinedInput-root': {
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#00F5A0',
                  borderWidth: '1.5px',
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#8A95AD', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              borderRadius: '16px',
              backgroundColor: '#00F5A0',
              color: '#031C0C',
              fontWeight: 800,
              fontFamily: 'Space Grotesk',
              px: 3.5,
              py: 1,
              '&:hover': { backgroundColor: '#00D68B' },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

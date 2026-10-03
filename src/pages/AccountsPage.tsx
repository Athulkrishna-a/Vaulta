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
} from '@mui/material';
import { Plus, Wallet, Edit2, ChevronLeft } from 'lucide-react';
import { Account, AccountType } from '../types';
import { useAppData } from '../app/providers/AppDataProvider';
import { GlassCard } from '../components/common/GlassCard';
import { CurrencyText } from '../components/common/CurrencyText';
import { calculateAccountBalances } from '../utils/calculations';
import { useHaptics } from '../hooks/useHaptics';
import { useNavigate } from 'react-router-dom';

export const AccountsPage: React.FC = () => {
  const theme = useTheme();
  const haptics = useHaptics();
  const navigate = useNavigate();
  const { accounts, transactions, addAccount, updateAccount, settings } = useAppData();

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const [name, setName] = useState<string>('');
  const [type, setType] = useState<AccountType>('bank');
  const [initialBalance, setInitialBalance] = useState<string>('0');

  const balances = calculateAccountBalances(accounts, transactions);

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setName('');
    setType('bank');
    setInitialBalance('0');
    setDialogOpen(true);
  };

  const handleOpenEdit = (acc: Account) => {
    setEditingAccount(acc);
    setName(acc.name);
    setType(acc.type);
    setInitialBalance(acc.initialBalance.toString());
    setDialogOpen(true);
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
      });
    } else {
      await addAccount({
        name: name.trim(),
        type,
        initialBalance: numInitial,
        currency: settings.currency,
        color: '#3498DB',
        icon: 'Wallet',
      });
    }
    setDialogOpen(false);
  };

  return (
    <Box sx={{ p: 2, pt: 'calc(env(safe-area-inset-top, 0px) + 24px)', pb: 12 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
          <IconButton
            onClick={() => {
              haptics.impactLight();
              navigate(-1);
            }}
            sx={{
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              width: 38,
              height: 38,
              borderRadius: '12px',
              border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
            }}
          >
            <ChevronLeft size={20} />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk' }}>
            Accounts & Wallets
          </Typography>
        </Box>
        {/* Top Right Add Icon Only */}
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
          }}
          title="Add Account"
        >
          <Plus size={22} strokeWidth={2.5} />
        </IconButton>
      </Box>

      <Grid container spacing={2}>
        {accounts.map((acc) => {
          const currentBal = balances.get(acc.id) || 0;
          return (
            <Grid key={acc.id} size={{ xs: 12, sm: 6 }}>
              <GlassCard sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '16px',
                      backgroundColor: `${theme.palette.primary.main}15`,
                      color: theme.palette.primary.main,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Wallet size={24} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      {acc.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'capitalize' }}>
                      {acc.type.replace('_', ' ')}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ textAlign: 'right' }}>
                  <CurrencyText amount={currentBal} sx={{ fontSize: '1.2rem', fontWeight: 800, display: 'block' }} />
                  <IconButton size="small" onClick={() => handleOpenEdit(acc)}>
                    <Edit2 size={16} />
                  </IconButton>
                </Box>
              </GlassCard>
            </Grid>
          );
        })}
      </Grid>

      {/* Add/Edit Account Dialog with High-Contrast Dark Glass */}
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
          {editingAccount ? 'Edit Account' : 'Add New Account'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Account Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{
              my: 2,
              '& label': { color: '#8A95AD', fontWeight: 600 },
              '& input': { color: '#F4F6FC', fontWeight: 700, fontFamily: 'Space Grotesk' },
              '& .MuiOutlinedInput-root': {
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                '&.Mui-focused': { border: '1.5px solid #00F5A0' },
              },
            }}
          />

          <TextField
            select
            fullWidth
            label="Account Type"
            value={type}
            onChange={(e) => setType(e.target.value as AccountType)}
            sx={{
              mb: 2,
              '& label': { color: '#8A95AD', fontWeight: 600 },
              '& .MuiSelect-select': { color: '#F4F6FC', fontWeight: 700, fontFamily: 'Space Grotesk' },
              '& .MuiOutlinedInput-root': {
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              },
            }}
          >
            <MenuItem value="cash">Cash</MenuItem>
            <MenuItem value="bank">Bank Account</MenuItem>
            <MenuItem value="upi">UPI Wallet</MenuItem>
            <MenuItem value="credit_card">Credit Card</MenuItem>
            <MenuItem value="wallet">Digital Wallet</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>

          <TextField
            fullWidth
            type="number"
            label="Initial Balance"
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
            sx={{
              '& label': { color: '#8A95AD', fontWeight: 600 },
              '& input': { color: '#F4F6FC', fontWeight: 700, fontFamily: 'Space Grotesk' },
              '& .MuiOutlinedInput-root': {
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
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

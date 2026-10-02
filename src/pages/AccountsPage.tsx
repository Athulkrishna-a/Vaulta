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
import { Plus, Wallet, Edit2 } from 'lucide-react';
import { Account, AccountType } from '../types';
import { useAppData } from '../app/providers/AppDataProvider';
import { GlassCard } from '../components/common/GlassCard';
import { CurrencyText } from '../components/common/CurrencyText';
import { calculateAccountBalances } from '../utils/calculations';
import { useHaptics } from '../hooks/useHaptics';

export const AccountsPage: React.FC = () => {
  const theme = useTheme();
  const haptics = useHaptics();
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
    <Box sx={{ p: 2, pb: 12 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Accounts & Wallets
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<Plus size={16} />}
          onClick={handleOpenAdd}
          sx={{ borderRadius: '14px' }}
        >
          Add Wallet
        </Button>
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

      {/* Add/Edit Account Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{ paper: { sx: { borderRadius: '28px', p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingAccount ? 'Edit Account' : 'Add New Account'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Account Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ my: 2 }}
          />

          <TextField
            select
            fullWidth
            label="Account Type"
            value={type}
            onChange={(e) => setType(e.target.value as AccountType)}
            sx={{ mb: 2 }}
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
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

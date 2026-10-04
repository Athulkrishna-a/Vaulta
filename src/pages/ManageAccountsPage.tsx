import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  useTheme,
  Chip,
} from '@mui/material';
import {
  ChevronLeft,
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  Wallet,
  CreditCard,
  Landmark,
  DollarSign,
  Smartphone,
} from 'lucide-react';
import { Reorder, useDragControls } from 'framer-motion';
import { Account, AccountType } from '../types';
import { useAppData } from '../app/providers/AppDataProvider';
import { GlassCard } from '../components/common/GlassCard';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useHaptics } from '../hooks/useHaptics';
import { useNavigate } from 'react-router-dom';

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

interface DraggableAccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

const DraggableAccountCard: React.FC<DraggableAccountCardProps> = ({ account, onEdit, onDelete }) => {
  const theme = useTheme();
  const controls = useDragControls();
  const IconComp = ACCOUNT_TYPE_ICONS[account.type] || Wallet;
  const color = account.color || ACCOUNT_COLORS[account.type] || '#3498DB';

  return (
    <Reorder.Item
      value={account}
      id={account.id}
      dragListener={false}
      dragControls={controls}
      style={{ listStyle: 'none', marginBottom: '12px' }}
      whileDrag={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', zIndex: 99 }}
    >
      <GlassCard sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '14px',
              backgroundColor: `${color}20`,
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconComp size={22} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk' }}>
              {account.name}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'capitalize' }}>
              {account.type.replace('_', ' ')} • Initial: ₹{account.initialBalance.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            size="small"
            onPointerDown={(e) => controls.start(e)}
            sx={{
              p: 0.6,
              color: theme.palette.text.secondary,
              cursor: 'grab',
              '&:active': { cursor: 'grabbing', color: '#00F5A0' },
              touchAction: 'none',
            }}
            title="Press and hold handle to drag & reorder"
          >
            <GripVertical size={18} />
          </IconButton>

          <IconButton size="small" onClick={() => onEdit(account)} sx={{ p: 0.6 }}>
            <Edit2 size={16} />
          </IconButton>

          <IconButton size="small" color="error" onClick={() => onDelete(account)} sx={{ p: 0.6 }}>
            <Trash2 size={16} />
          </IconButton>
        </Box>
      </GlassCard>
    </Reorder.Item>
  );
};

export const ManageAccountsPage: React.FC = () => {
  const theme = useTheme();
  const haptics = useHaptics();
  const navigate = useNavigate();
  const { accounts, addAccount, updateAccount, deleteAccount, reorderAccounts, settings } = useAppData();

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);

  const [name, setName] = useState<string>('');
  const [type, setType] = useState<AccountType>('bank');
  const [initialBalance, setInitialBalance] = useState<string>('0');
  const [selectedColor, setSelectedColor] = useState<string>('#3498DB');

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setName('');
    setType('bank');
    setInitialBalance('0');
    setSelectedColor('#3498DB');
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

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      haptics.notifyWarning();
      await deleteAccount(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const handleReorder = async (newOrdered: Account[]) => {
    haptics.impactLight();
    await reorderAccounts(newOrdered);
  };

  return (
    <Box sx={{ p: 2, pt: 'calc(env(safe-area-inset-top, 0px) + 24px)', pb: 12, maxWidth: 600, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0, flex: 1 }}>
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
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk' }}>
              Organize Accounts
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
              Press & hold 2-line handle to drag and reorder account priority
            </Typography>
          </Box>
        </Box>

        {/* Top Right Add Icon Only Button */}
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
          <Plus size={22} strokeWidth={2.8} />
        </IconButton>
      </Box>

      {/* Drag & Drop Reorderable List */}
      <Reorder.Group
        values={accounts}
        onReorder={handleReorder}
        style={{ padding: 0, margin: 0, listStyle: 'none' }}
      >
        {accounts.map((acc) => (
          <DraggableAccountCard
            key={acc.id}
            account={acc}
            onEdit={handleOpenEdit}
            onDelete={(target) => setDeleteTarget(target)}
          />
        ))}
      </Reorder.Group>

      {/* Add / Edit Dialog */}
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{
              mb: 2,
              '& label': { color: '#8A95AD', fontWeight: 600 },
              '& label.MuiInputLabel-shrink': { backgroundColor: '#0F1420', px: 0.8, borderRadius: '4px', zIndex: 1 },
              '& input': { color: '#F4F6FC', fontWeight: 700, fontFamily: 'Space Grotesk' },
              '& .MuiOutlinedInput-root': {
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.15)' },
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
              '& label.MuiInputLabel-shrink': { backgroundColor: '#0F1420', px: 0.8, borderRadius: '4px', zIndex: 1 },
              '& .MuiSelect-select': { color: '#F4F6FC', fontWeight: 700, fontFamily: 'Space Grotesk' },
              '& .MuiOutlinedInput-root': {
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.15)' },
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
              '& label.MuiInputLabel-shrink': { backgroundColor: '#0F1420', px: 0.8, borderRadius: '4px', zIndex: 1 },
              '& input': { color: '#F4F6FC', fontWeight: 700, fontFamily: 'Space Grotesk' },
              '& .MuiOutlinedInput-root': {
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.15)' },
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
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Account?"
        message={`Are you sure you want to remove ${deleteTarget?.name}? Existing transactions will remain intact.`}
        confirmText="Delete"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

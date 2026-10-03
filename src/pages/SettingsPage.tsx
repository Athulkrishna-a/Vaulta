import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  TextField,
  Divider,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  useTheme,
} from '@mui/material';
import {
  Sun,
  Moon,
  Smartphone,
  Target,
  Grid,
  Wallet,
  Database,
  Lock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Palette,
  Sliders,
  Calendar,
  CreditCard,
  Vibrate,
  Bell,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppData } from '../app/providers/AppDataProvider';
import { useAppTheme } from '../app/providers/ThemeProvider';
import { useSecurity } from '../app/providers/SecurityProvider';
import { BackupRestoreDialog } from '../components/settings/BackupRestoreDialog';
import { useNavigate } from 'react-router-dom';
import { CurrencyCode, DateFormatOption, PaymentMethod } from '../types';
import { useHaptics } from '../hooks/useHaptics';

export const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const haptics = useHaptics();
  const { settings, updateSettings, currentBudget, updateBudget } = useAppData();
  const { mode, setMode } = useAppTheme();
  const { setPin, clearPin } = useSecurity();

  const [backupDialogOpen, setBackupDialogOpen] = useState<boolean>(false);
  const [budgetDialogOpen, setBudgetDialogOpen] = useState<boolean>(false);
  const [budgetValue, setBudgetValue] = useState<string>(
    currentBudget ? currentBudget.amount.toString() : '30000'
  );

  const [pinDialogOpen, setPinDialogOpen] = useState<boolean>(false);
  const [newPin, setNewPin] = useState<string>('');

  const handleThemeChange = (newMode: any) => {
    haptics.impactLight();
    setMode(newMode);
    updateSettings({ theme: newMode });
  };

  const handleCurrencyChange = (currency: CurrencyCode) => {
    haptics.impactLight();
    updateSettings({ currency });
  };

  const handleSaveBudget = async () => {
    haptics.impactMedium();
    const amount = parseFloat(budgetValue) || 0;
    await updateBudget(amount);
    setBudgetDialogOpen(false);
  };

  const handleSavePin = async () => {
    if (newPin.length === 4) {
      haptics.notifySuccess();
      await setPin(newPin);
      setPinDialogOpen(false);
      setNewPin('');
    }
  };

  const handleRemovePin = async () => {
    haptics.notifyWarning();
    await clearPin();
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      sx={{ p: 2, pt: 'calc(env(safe-area-inset-top, 0px) + 24px)', pb: 14 }}
    >
      {/* Top Left Glass Back Button + Page Title Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
        <IconButton
          onClick={() => {
            haptics.impactLight();
            navigate(-1);
          }}
          sx={{
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            width: 42,
            height: 42,
            borderRadius: '14px',
            boxShadow: theme.palette.mode === 'light' ? '0 4px 12px rgba(0,0,0,0.04)' : 'none',
            border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
          }}
        >
          <ChevronLeft size={22} />
        </IconButton>

        <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk' }}>
          Settings & Customization
        </Typography>
      </Box>

      {/* 1. Appearance & Regional Preferences */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '28px',
          p: 2.5,
          mb: 2.5,
          background: theme.palette.background.glass,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${theme.palette.background.glassBorder}`,
          boxShadow: theme.palette.mode === 'light' ? '0 8px 24px rgba(0,0,0,0.03)' : '0 8px 24px rgba(0,0,0,0.2)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              backgroundColor: `${theme.palette.primary.main}15`,
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Palette size={18} />
          </Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.text.secondary, letterSpacing: '0.05em' }}>
            APPEARANCE & FORMATTING
          </Typography>
        </Box>

        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: theme.palette.text.primary, fontFamily: 'Space Grotesk' }}>
          App Theme Mode
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
          {[
            { value: 'system', label: 'System', icon: <Smartphone size={18} /> },
            { value: 'light', label: 'Light', icon: <Sun size={18} /> },
            { value: 'dark', label: 'Dark', icon: <Moon size={18} /> },
          ].map((item) => {
            const isSelected = mode === item.value;
            return (
              <Button
                key={item.value}
                fullWidth
                onClick={() => handleThemeChange(item.value)}
                variant={isSelected ? 'contained' : 'outlined'}
                startIcon={item.icon}
                sx={{
                  py: 1.2,
                  borderRadius: '16px',
                  fontWeight: 800,
                  fontFamily: 'Space Grotesk',
                  fontSize: '0.85rem',
                  textTransform: 'none',
                  backgroundColor: isSelected ? theme.palette.primary.main : 'rgba(255, 255, 255, 0.04)',
                  color: isSelected ? '#FFFFFF' : theme.palette.text.primary,
                  border: isSelected ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: isSelected ? '0 4px 14px rgba(0,0,0,0.25)' : 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: isSelected ? theme.palette.primary.dark : 'rgba(255, 255, 255, 0.08)',
                  },
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>

        <TextField
          select
          fullWidth
          size="small"
          label="Currency Format"
          value={settings.currency}
          onChange={(e) => handleCurrencyChange(e.target.value as CurrencyCode)}
        >
          <MenuItem value="INR">INR (₹ Indian Rupee)</MenuItem>
          <MenuItem value="USD">USD ($ US Dollar)</MenuItem>
          <MenuItem value="EUR">EUR (€ Euro)</MenuItem>
          <MenuItem value="GBP">GBP (£ British Pound)</MenuItem>
        </TextField>
      </Paper>

      {/* 2. Customization Controls */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '28px',
          p: 2.5,
          mb: 2.5,
          background: theme.palette.background.glass,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${theme.palette.background.glassBorder}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              backgroundColor: `${theme.palette.primary.main}15`,
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Vibrate size={18} />
          </Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.text.secondary, letterSpacing: '0.05em' }}>
            HAPTICS & NOTATIONS
          </Typography>
        </Box>

        <List disablePadding>
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon>
              <Vibrate color={theme.palette.primary.main} size={20} />
            </ListItemIcon>
            <ListItemText primary="Haptic Vibration Feedback" secondary="Vibrate on button press & transaction saves" />
            <Switch
              checked={settings.haptics ?? true}
              onChange={(e) => updateSettings({ haptics: e.target.checked })}
            />
          </ListItem>
          <Divider />

          <ListItem sx={{ px: 0 }}>
            <ListItemIcon>
              <Bell color={theme.palette.primary.main} size={20} />
            </ListItemIcon>
            <ListItemText primary="Daily Reminder Notifications" secondary="Remind to log expenses at 8:00 PM" />
            <Switch
              checked={settings.notifications ?? true}
              onChange={(e) => updateSettings({ notifications: e.target.checked })}
            />
          </ListItem>
        </List>
      </Paper>

      {/* 3. Management & Preferences List Card */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '28px',
          p: 1,
          mb: 2.5,
          background: theme.palette.background.glass,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${theme.palette.background.glassBorder}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              backgroundColor: `${theme.palette.primary.main}15`,
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sliders size={18} />
          </Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.text.secondary, letterSpacing: '0.05em' }}>
            PREFERENCES & MANAGEMENT
          </Typography>
        </Box>

        <List disablePadding sx={{ px: 0.5 }}>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton onClick={() => setBudgetDialogOpen(true)} sx={{ borderRadius: '16px' }}>
              <ListItemIcon>
                <Target color={theme.palette.primary.main} size={20} />
              </ListItemIcon>
              <ListItemText
                primary="Monthly Spending Budget"
                secondary={
                  currentBudget && currentBudget.amount > 0
                    ? `Configured: ₹${currentBudget.amount.toLocaleString()}`
                    : 'Not configured'
                }
              />
              <ChevronRight size={18} color={theme.palette.text.disabled} />
            </ListItemButton>
          </ListItem>
          <Divider sx={{ mx: 2, my: 0.5 }} />

          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton onClick={() => navigate('/categories')} sx={{ borderRadius: '16px' }}>
              <ListItemIcon>
                <Grid color={theme.palette.primary.main} size={20} />
              </ListItemIcon>
              <ListItemText primary="Manage Categories" secondary="Add, edit, reorder or delete categories" />
              <ChevronRight size={18} color={theme.palette.text.disabled} />
            </ListItemButton>
          </ListItem>
          <Divider sx={{ mx: 2, my: 0.5 }} />

          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton onClick={() => navigate('/payment-methods')} sx={{ borderRadius: '16px' }}>
              <ListItemIcon>
                <CreditCard color={theme.palette.primary.main} size={20} />
              </ListItemIcon>
              <ListItemText primary="Manage Payment Methods" secondary="Add, edit, reorder or delete payment modes" />
              <ChevronRight size={18} color={theme.palette.text.disabled} />
            </ListItemButton>
          </ListItem>
          <Divider sx={{ mx: 2, my: 0.5 }} />

          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton onClick={() => navigate('/investment-types')} sx={{ borderRadius: '16px' }}>
              <ListItemIcon>
                <TrendingUp color="#F1C40F" size={20} />
              </ListItemIcon>
              <ListItemText primary="Manage Investment Types" secondary="Stocks, Mutual Funds, Gold, Crypto & Custom" />
              <ChevronRight size={18} color={theme.palette.text.disabled} />
            </ListItemButton>
          </ListItem>
          <Divider sx={{ mx: 2, my: 0.5 }} />

          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton onClick={() => navigate('/accounts')} sx={{ borderRadius: '16px' }}>
              <ListItemIcon>
                <Wallet color={theme.palette.primary.main} size={20} />
              </ListItemIcon>
              <ListItemText primary="Manage Accounts & Wallets" secondary="Cash, Bank, UPI, Credit Card" />
              <ChevronRight size={18} color={theme.palette.text.disabled} />
            </ListItemButton>
          </ListItem>
          <Divider sx={{ mx: 2, my: 0.5 }} />

          <ListItem disablePadding>
            <ListItemButton onClick={() => setBackupDialogOpen(true)} sx={{ borderRadius: '16px' }}>
              <ListItemIcon>
                <Database color={theme.palette.primary.main} size={20} />
              </ListItemIcon>
              <ListItemText primary="Backup & Restore Data" secondary="Export JSON/CSV or import backup" />
              <ChevronRight size={18} color={theme.palette.text.disabled} />
            </ListItemButton>
          </ListItem>
        </List>
      </Paper>

      {/* 4. Security Card */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '28px',
          p: 1.5,
          mb: 2.5,
          background: theme.palette.background.glass,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${theme.palette.background.glassBorder}`,
        }}
      >
        <List disablePadding>
          <ListItem>
            <ListItemIcon>
              <Lock color={theme.palette.primary.main} size={20} />
            </ListItemIcon>
            <ListItemText
              primary="PIN Lock Protection"
              secondary={settings.securityLock ? 'App lock enabled' : 'App lock disabled'}
            />
            <IconButton
              onClick={() => {
                if (settings.securityLock) {
                  handleRemovePin();
                } else {
                  setPinDialogOpen(true);
                }
              }}
              sx={{
                width: 44,
                height: 44,
                borderRadius: '14px',
                backgroundColor: settings.securityLock ? 'rgba(0, 245, 160, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                color: settings.securityLock ? '#00F5A0' : theme.palette.text.secondary,
                border: settings.securityLock ? '1px solid rgba(0, 245, 160, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: settings.securityLock ? 'rgba(0, 245, 160, 0.25)' : 'rgba(255, 255, 255, 0.12)',
                },
              }}
              title={settings.securityLock ? 'Tap to disable lock' : 'Tap to enable lock'}
            >
              <Lock size={20} />
            </IconButton>
          </ListItem>
        </List>
      </Paper>

      {/* 5. Privacy Card */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '28px',
          p: 3,
          textAlign: 'center',
          background: theme.palette.background.glass,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${theme.palette.background.glassBorder}`,
        }}
      >
        <ShieldCheck size={36} color={theme.palette.primary.main} style={{ marginBottom: 8 }} />
        <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk' }}>
          Offline-First & Private
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
          ExpenseTrack stores 100% of your financial data locally on your device. No cloud account or external
          servers are required.
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', color: theme.palette.text.disabled, mt: 2 }}>
          ExpenseTrack v1.0.0 (Capacitor Android Build)
        </Typography>
      </Paper>

      {/* Backup & Restore Dialog */}
      <BackupRestoreDialog open={backupDialogOpen} onClose={() => setBackupDialogOpen(false)} />

      {/* Budget Set Dialog */}
      <Dialog
        open={budgetDialogOpen}
        onClose={() => setBudgetDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: {
              borderRadius: '28px',
              p: 1.5,
              background: 'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(0, 245, 160, 0.15) 0%, rgba(15, 17, 24, 0.98) 100%)',
              color: '#F4F6FC',
              border: '1.5px solid rgba(0, 245, 160, 0.3)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(25px)',
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontFamily: 'Space Grotesk', color: '#00F5A0' }}>Set Monthly Budget</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="number"
            label="Monthly Limit (₹)"
            value={budgetValue}
            onChange={(e) => setBudgetValue(e.target.value)}
            sx={{
              mt: 2,
              '& input': { color: '#F4F6FC', fontWeight: 700, fontFamily: 'Space Grotesk' },
              '& label': { color: '#8A95AD' },
              '& .MuiOutlinedInput-root': { borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.05)' },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setBudgetDialogOpen(false)} sx={{ color: '#8A95AD', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveBudget}
            sx={{
              borderRadius: '16px',
              backgroundColor: '#00F5A0',
              color: '#0B0E17',
              fontWeight: 800,
              fontFamily: 'Space Grotesk',
              px: 3,
            }}
          >
            Save Budget
          </Button>
        </DialogActions>
      </Dialog>

      {/* PIN Dialog */}
      <Dialog
        open={pinDialogOpen}
        onClose={() => setPinDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: {
              borderRadius: '28px',
              p: 1.5,
              background: 'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(124, 77, 255, 0.15) 0%, rgba(15, 17, 24, 0.98) 100%)',
              color: '#F4F6FC',
              border: '1.5px solid rgba(124, 77, 255, 0.3)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(25px)',
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontFamily: 'Space Grotesk', color: '#7C4DFF' }}>Set 4-Digit Security PIN</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="password"
            label="Enter 4-Digit PIN"
            value={newPin}
            onChange={(e) => {
              if (e.target.value.length <= 4) setNewPin(e.target.value);
            }}
            slotProps={{ htmlInput: { maxLength: 4, inputMode: 'numeric' } }}
            sx={{
              mt: 2,
              '& input': { color: '#F4F6FC', fontWeight: 700, fontFamily: 'Space Grotesk', letterSpacing: '0.4em', textAlign: 'center' },
              '& label': { color: '#8A95AD' },
              '& .MuiOutlinedInput-root': { borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.05)' },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPinDialogOpen(false)} sx={{ color: '#8A95AD', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={newPin.length !== 4}
            onClick={handleSavePin}
            sx={{
              borderRadius: '16px',
              backgroundColor: '#7C4DFF',
              color: '#FFFFFF',
              fontWeight: 800,
              fontFamily: 'Space Grotesk',
              px: 3,
            }}
          >
            Enable Lock
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

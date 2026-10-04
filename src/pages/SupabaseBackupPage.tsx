import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  TextField,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  ChevronLeft,
  Cloud,
  CloudOff,
  Download,
  UploadCloud,
  LogOut,
  Clock,
  ShieldCheck,
  AlertTriangle,
  User as UserIcon,
  Lock as LockIcon,
  RefreshCw,
  KeyRound,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { getCurrentUser, signInWithEmail, signUpWithEmail, signOutUser, resetPasswordForEmail, subscribeToAuthChanges } from '../services/supabaseAuth';
import { backupToSupabase, restoreFromSupabase, StorageSyncResult } from '../services/supabaseStorageSync';
import { useAppData } from '../app/providers/AppDataProvider';
import { useHaptics } from '../hooks/useHaptics';
import { format } from 'date-fns';
import { BackupInterval } from '../types';

export const SupabaseBackupPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const haptics = useHaptics();
  const { settings, updateSettings } = useAppData();

  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  const [operating, setOperating] = useState<boolean>(false);
  const [operationStage, setOperationStage] = useState<string>('');
  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    initAuth();
    const subscription = subscribeToAuthChanges((u: User | null) => {
      setUser(u);
      setLoadingAuth(false);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const initAuth = async () => {
    setLoadingAuth(true);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.warn('Auth check exception:', err);
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setAlertMessage({ type: 'error', text: 'Please enter both email and password.' });
      return;
    }

    haptics.impactMedium();
    setAuthLoading(true);
    setAlertMessage(null);
    try {
      const { user: signedInUser, error } = await signInWithEmail(email, password);
      if (error) {
        setAlertMessage({ type: 'error', text: error.message });
        haptics.notifyError();
      } else {
        setUser(signedInUser);
        haptics.notifySuccess();
        setAlertMessage({ type: 'success', text: `Signed in successfully as ${signedInUser?.email}` });
      }
    } catch (err) {
      setAlertMessage({ type: 'error', text: (err as Error).message });
      haptics.notifyError();
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setAlertMessage({ type: 'error', text: 'Please enter both email and password.' });
      return;
    }
    if (password.length < 6) {
      setAlertMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    haptics.impactMedium();
    setAuthLoading(true);
    setAlertMessage(null);
    try {
      const { user: newUser, error } = await signUpWithEmail(email, password);
      if (error) {
        setAlertMessage({ type: 'error', text: error.message });
        haptics.notifyError();
      } else {
        setUser(newUser);
        haptics.notifySuccess();
        setAlertMessage({ type: 'success', text: 'Account created! Please check your email for confirmation if required.' });
      }
    } catch (err) {
      setAlertMessage({ type: 'error', text: (err as Error).message });
      haptics.notifyError();
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setAlertMessage({ type: 'error', text: 'Please enter your email address in the field above first.' });
      return;
    }

    haptics.impactMedium();
    setAuthLoading(true);
    setAlertMessage(null);
    try {
      const { error } = await resetPasswordForEmail(email);
      if (error) {
        setAlertMessage({ type: 'error', text: error.message });
        haptics.notifyError();
      } else {
        haptics.notifySuccess();
        setAlertMessage({ type: 'success', text: `Password reset link sent to ${email}. Please check your email inbox.` });
      }
    } catch (err) {
      setAlertMessage({ type: 'error', text: (err as Error).message });
      haptics.notifyError();
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    haptics.notifyWarning();
    setAlertMessage(null);
    try {
      await signOutUser();
      setUser(null);
      setAlertMessage({ type: 'info', text: 'Signed out from Supabase Cloud.' });
    } catch (err) {
      setAlertMessage({ type: 'error', text: (err as Error).message });
    }
  };

  const handleBackupNow = async () => {
    haptics.impactMedium();
    setAlertMessage(null);
    setOperating(true);
    setOperationStage('Generating local JSON payload & uploading to Supabase Storage...');
    try {
      const result: StorageSyncResult = await backupToSupabase();
      haptics.notifySuccess();
      const formattedDate = format(new Date(result.timestamp || new Date()), 'dd MMM yyyy, h:mm a');
      setAlertMessage({
        type: 'success',
        text: `Cloud Backup complete! Uploaded ${result.summary?.transactionCount || 0} Transactions, ${result.summary?.categoryCount || 0} Categories (${formattedDate}).`,
      });
    } catch (err) {
      haptics.notifyError();
      setAlertMessage({ type: 'error', text: (err as Error).message });
    } finally {
      setOperating(false);
      setOperationStage('');
    }
  };

  const handleRestoreNow = async () => {
    setConfirmRestoreOpen(false);
    haptics.impactHeavy();
    setAlertMessage(null);
    setOperating(true);
    setOperationStage('Downloading cloud JSON backup & updating local database...');
    try {
      const result: StorageSyncResult = await restoreFromSupabase();
      haptics.notifySuccess();
      setAlertMessage({
        type: 'success',
        text: `Restore complete! Restored ${result.summary?.transactionCount || 0} Transactions, ${result.summary?.categoryCount || 0} Categories into local database. App will refresh now.`,
      });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      haptics.notifyError();
      setAlertMessage({ type: 'error', text: (err as Error).message });
    } finally {
      setOperating(false);
      setOperationStage('');
    }
  };

  const handleIntervalChange = async (interval: BackupInterval) => {
    haptics.impactLight();
    const currentDriveConfig = settings.driveBackup || {
      connected: true,
      autoBackup: false,
      interval: 'manual',
      wifiOnly: false,
    };

    const updatedDriveBackup = {
      ...currentDriveConfig,
      connected: true,
      userEmail: user?.email || currentDriveConfig.userEmail,
      autoBackup: interval !== 'never' && interval !== 'manual',
      interval,
    };

    await updateSettings({ driveBackup: updatedDriveBackup });
    const intervalLabel =
      interval === 'daily'
        ? 'Daily'
        : interval === 'weekly'
        ? 'Weekly'
        : interval === 'monthly'
        ? 'Monthly'
        : interval === '90_days'
        ? '90 Days'
        : 'Never';
    setAlertMessage({ type: 'success', text: `Auto-backup interval set to ${intervalLabel}.` });
  };

  const lastBackupText = settings.driveBackup?.lastBackupTimestamp
    ? format(new Date(settings.driveBackup.lastBackupTimestamp), 'dd MMM yyyy, h:mm a')
    : 'Never';

  const currentInterval: BackupInterval = settings.driveBackup?.interval || (settings.driveBackup?.autoBackup ? 'daily' : 'never');

  return (
    <Box sx={{ pb: 10, px: 2, pt: 2, maxWidth: 600, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <IconButton
          onClick={() => navigate('/settings')}
          sx={{
            width: 44,
            height: 44,
            borderRadius: '16px',
            backgroundColor: theme.palette.background.surfaceContainerHigh,
          }}
        >
          <ChevronLeft size={22} />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk' }}>
            Supabase Cloud Backup
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            Private Storage JSON Backup & Restore
          </Typography>
        </Box>
      </Box>

      {alertMessage && (
        <Alert
          severity={alertMessage.type}
          onClose={() => setAlertMessage(null)}
          sx={{ mb: 2.5, borderRadius: '18px' }}
        >
          {alertMessage.text}
        </Alert>
      )}

      {operating && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 2.5,
            borderRadius: '24px',
            backgroundColor: 'rgba(0, 245, 160, 0.08)',
            border: '1px solid rgba(0, 245, 160, 0.3)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <CircularProgress size={22} color="primary" />
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#00F5A0' }}>
              {operationStage}
            </Typography>
          </Box>
          <LinearProgress color="primary" sx={{ borderRadius: 4, height: 6 }} />
        </Paper>
      )}

      {loadingAuth ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <CircularProgress color="primary" />
          <Typography variant="body2" sx={{ mt: 2, color: theme.palette.text.secondary }}>
            Checking Supabase authentication session...
          </Typography>
        </Box>
      ) : !user ? (
        /* LOGGED OUT STATE */
        <Paper
          elevation={0}
          sx={{
            p: 3.5,
            borderRadius: '28px',
            background: theme.palette.background.glass,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme.palette.background.glassBorder}`,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 54,
                height: 54,
                borderRadius: '20px',
                backgroundColor: 'rgba(0, 245, 160, 0.15)',
                color: '#00F5A0',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
              }}
            >
              <Cloud size={28} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk' }}>
              Cloud Account Sign In
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
              Sign in to backup and restore your Vaulta data safely in Supabase Storage.
            </Typography>
          </Box>

          <form onSubmit={authMode === 'signin' ? handleSignIn : handleSignUp}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                mb: 2,
                '& label': { color: theme.palette.text.secondary },
                '& .MuiOutlinedInput-root': { borderRadius: '16px' },
              }}
              slotProps={{
                input: {
                  startAdornment: <UserIcon size={20} color={theme.palette.text.secondary} style={{ marginRight: 8 }} />,
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                mb: 1,
                '& label': { color: theme.palette.text.secondary },
                '& .MuiOutlinedInput-root': { borderRadius: '16px' },
              }}
              slotProps={{
                input: {
                  startAdornment: <LockIcon size={20} color={theme.palette.text.secondary} style={{ marginRight: 8 }} />,
                },
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2.5 }}>
              <Button
                size="small"
                variant="text"
                onClick={handleForgotPassword}
                disabled={authLoading}
                startIcon={<KeyRound size={14} />}
                sx={{
                  color: '#00F5A0',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  p: 0,
                  minWidth: 0,
                  '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
                }}
              >
                Forgot Password?
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                fullWidth
                type="submit"
                variant={authMode === 'signin' ? 'contained' : 'outlined'}
                onClick={() => setAuthMode('signin')}
                disabled={authLoading}
                sx={{
                  py: 1.4,
                  borderRadius: '16px',
                  fontWeight: 800,
                  backgroundColor: authMode === 'signin' ? '#00F5A0' : 'transparent',
                  color: authMode === 'signin' ? '#0B0E17' : '#00F5A0',
                  '&:hover': { backgroundColor: '#00D68B' },
                }}
              >
                {authLoading && authMode === 'signin' ? <CircularProgress size={20} color="inherit" /> : 'Sign In'}
              </Button>

              <Button
                fullWidth
                type="button"
                variant={authMode === 'signup' ? 'contained' : 'outlined'}
                onClick={(e) => {
                  setAuthMode('signup');
                  handleSignUp(e);
                }}
                disabled={authLoading}
                sx={{
                  py: 1.4,
                  borderRadius: '16px',
                  fontWeight: 800,
                }}
              >
                {authLoading && authMode === 'signup' ? <CircularProgress size={20} color="inherit" /> : 'Create'}
              </Button>
            </Box>
          </form>
        </Paper>
      ) : (
        /* LOGGED IN STATE */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Account Status Card */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '28px',
              background: theme.palette.background.glass,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.palette.background.glassBorder}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '16px',
                    backgroundColor: 'rgba(0, 245, 160, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#00F5A0',
                    flexShrink: 0,
                  }}
                >
                  <Cloud size={24} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700, letterSpacing: '0.04em' }}>
                    ACCOUNT
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    noWrap
                    sx={{
                      fontWeight: 800,
                      fontFamily: 'Space Grotesk',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {user.email}
                  </Typography>
                </Box>
              </Box>

              <Chip
                label="Connected"
                size="small"
                color="success"
                variant="outlined"
                sx={{ fontWeight: 800, height: 26, borderRadius: '10px', flexShrink: 0 }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Clock size={18} color={theme.palette.primary.main} />
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                  Last Cloud Backup:
                </Typography>
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk', color: '#00F5A0' }}>
                {lastBackupText}
              </Typography>
            </Box>
          </Paper>

          {/* Automatic Backup Interval Selector Card */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '28px',
              background: theme.palette.background.glass,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.palette.background.glassBorder}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1 }}>
              <RefreshCw size={20} color="#00F5A0" />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk' }}>
                Automatic Cloud Backup Schedule
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 2 }}>
              Choose how frequently Vaulta automatically backs up your transactions and data to Supabase Storage.
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {[
                { id: 'daily', label: 'Daily' },
                { id: 'weekly', label: 'Weekly' },
                { id: 'monthly', label: 'Monthly' },
                { id: '90_days', label: '90 Days' },
                { id: 'never', label: 'Never' },
              ].map((opt) => {
                const isSelected = currentInterval === opt.id;
                return (
                  <Chip
                    key={opt.id}
                    label={opt.label}
                    onClick={() => handleIntervalChange(opt.id as BackupInterval)}
                    sx={{
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontFamily: 'Space Grotesk',
                      px: 0.5,
                      py: 2,
                      backgroundColor: isSelected ? '#00F5A0' : 'rgba(255, 255, 255, 0.05)',
                      color: isSelected ? '#0B0E17' : '#F4F6FC',
                      border: isSelected ? '1.5px solid #00F5A0' : '1px solid rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        backgroundColor: isSelected ? '#00D68B' : 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  />
                );
              })}
            </Box>
          </Paper>

          {/* Cloud Actions Card */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '28px',
              background: theme.palette.background.glass,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.palette.background.glassBorder}`,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
              Cloud Backup & Restore Actions
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 2.5 }}>
              Upload your latest expense JSON file to Supabase Storage or download to restore on this device.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, mb: 2 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<UploadCloud size={20} />}
                onClick={handleBackupNow}
                disabled={operating}
                sx={{
                  py: 1.5,
                  borderRadius: '18px',
                  fontWeight: 800,
                  backgroundColor: theme.palette.primary.main,
                  color: '#0B0E17',
                  '&:hover': { backgroundColor: '#00D68B' },
                }}
              >
                Backup Now
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<Download size={20} />}
                onClick={() => setConfirmRestoreOpen(true)}
                disabled={operating}
                sx={{
                  py: 1.5,
                  borderRadius: '18px',
                  fontWeight: 800,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                }}
              >
                Restore Cloud Backup
              </Button>
            </Box>

            <Button
              fullWidth
              variant="text"
              color="error"
              startIcon={<LogOut size={18} />}
              onClick={handleSignOut}
              disabled={operating}
              sx={{ borderRadius: '14px', textTransform: 'none', fontWeight: 700 }}
            >
              Sign Out
            </Button>
          </Paper>
        </Box>
      )}

      {/* Confirmation Dialog before Cloud Restore */}
      <Dialog
        open={confirmRestoreOpen}
        onClose={() => setConfirmRestoreOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '24px',
              p: 1,
              background: '#0F1118',
              border: '1px solid rgba(235, 87, 87, 0.3)',
            },
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          <AlertTriangle color="#EB5757" size={24} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Confirm Cloud Restore
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1.5 }}>
            Restoring from Supabase Cloud Storage will update your local database with your latest cloud JSON backup file ({lastBackupText}).
          </Typography>
          <Typography variant="caption" sx={{ color: '#EB5757', fontWeight: 700 }}>
            Are you sure you want to proceed with restoring data onto this device?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setConfirmRestoreOpen(false)} sx={{ borderRadius: '12px' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRestoreNow}
            sx={{ borderRadius: '12px', fontWeight: 800 }}
          >
            Confirm & Restore
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Switch,
  Radio,
  RadioGroup,
  FormControlLabel,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  useTheme,
  LinearProgress,
} from '@mui/material';
import {
  Cloud,
  CloudOff,
  RefreshCw,
  Download,
  UploadCloud,
  CheckCircle,
  X,
  Wifi,
  Clock,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { googleDriveService, DriveAuthInfo } from '../../services/GoogleDriveService';
import { backupService, BackupProgressState } from '../../services/BackupService';
import { useAppData } from '../../app/providers/AppDataProvider';
import { useHaptics } from '../../hooks/useHaptics';
import { BackupInterval, DriveBackupConfig } from '../../types';
import { format } from 'date-fns';

interface GoogleDriveBackupDialogProps {
  open: boolean;
  onClose: () => void;
}

export const GoogleDriveBackupDialog: React.FC<GoogleDriveBackupDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const haptics = useHaptics();
  const { settings, updateSettings } = useAppData();

  const [authInfo, setAuthInfo] = useState<DriveAuthInfo>({ connected: false });
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [progressState, setProgressState] = useState<BackupProgressState>({
    inProgress: false,
    stage: 'idle',
    message: '',
  });

  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const driveConfig: DriveBackupConfig = settings.driveBackup || {
    connected: false,
    autoBackup: false,
    interval: 'weekly',
    wifiOnly: true,
  };

  useEffect(() => {
    if (open) {
      loadAuthState();
    }
  }, [open]);

  const loadAuthState = async () => {
    setLoadingAuth(true);
    try {
      const info = await googleDriveService.init();
      setAuthInfo(info);
      if (info.connected !== driveConfig.connected) {
        updateSettings({
          driveBackup: { ...driveConfig, connected: info.connected, userEmail: info.userEmail },
        });
      }
    } catch (err) {
      console.warn('Auth check error:', err);
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleConnect = async () => {
    haptics.impactMedium();
    setLoadingAuth(true);
    try {
      const info = await googleDriveService.connect();
      setAuthInfo(info);
      await updateSettings({
        driveBackup: { ...driveConfig, connected: true, userEmail: info.userEmail },
      });
      haptics.notifySuccess();
      setAlertMessage({ type: 'success', text: `Connected successfully to Google Drive (${info.userEmail})` });
    } catch (err) {
      haptics.notifyError();
      setAlertMessage({ type: 'error', text: (err as Error).message });
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleDisconnect = async () => {
    haptics.notifyWarning();
    try {
      await googleDriveService.disconnect();
      setAuthInfo({ connected: false });
      await updateSettings({
        driveBackup: { ...driveConfig, connected: false, userEmail: undefined },
      });
      setAlertMessage({ type: 'info', text: 'Disconnected from Google Drive.' });
    } catch (err) {
      setAlertMessage({ type: 'error', text: (err as Error).message });
    }
  };

  const handleToggleAutoBackup = async (checked: boolean) => {
    haptics.impactLight();
    const newConfig: DriveBackupConfig = {
      ...driveConfig,
      autoBackup: checked,
      interval: checked && driveConfig.interval === 'manual' ? 'weekly' : driveConfig.interval,
    };
    await updateSettings({ driveBackup: newConfig });
  };

  const handleIntervalChange = async (newInterval: BackupInterval) => {
    haptics.impactLight();
    const newConfig: DriveBackupConfig = {
      ...driveConfig,
      interval: newInterval,
      autoBackup: newInterval !== 'manual',
    };
    await updateSettings({ driveBackup: newConfig });
  };

  const handleWifiToggle = async (checked: boolean) => {
    haptics.impactLight();
    await updateSettings({
      driveBackup: { ...driveConfig, wifiOnly: checked },
    });
  };

  const handleBackupNow = async () => {
    haptics.impactMedium();
    setAlertMessage(null);
    try {
      const result = await backupService.performCloudBackup((state) => setProgressState(state));
      const formattedDate = format(new Date(result.timestamp), 'dd MMM yyyy, h:mm a');
      await updateSettings({
        driveBackup: { ...driveConfig, lastBackupTimestamp: result.timestamp },
      });
      haptics.notifySuccess();
      setAlertMessage({ type: 'success', text: `Backup created & encrypted on Google Drive (${formattedDate})` });
    } catch (err) {
      haptics.notifyError();
      setAlertMessage({ type: 'error', text: (err as Error).message });
    }
  };

  const handleRestoreNow = async () => {
    setConfirmRestoreOpen(false);
    haptics.impactHeavy();
    setAlertMessage(null);
    try {
      const validation = await backupService.performCloudRestore((state) => setProgressState(state));
      if (validation.valid) {
        haptics.notifySuccess();
        const summary = validation.summary;
        setAlertMessage({
          type: 'success',
          text: `Restored successfully! (${summary?.transactionCount || 0} Transactions, ${summary?.categoryCount || 0} Categories). App will refresh now.`,
        });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      haptics.notifyError();
      setAlertMessage({ type: 'error', text: (err as Error).message });
    }
  };

  const lastBackupText = driveConfig.lastBackupTimestamp
    ? format(new Date(driveConfig.lastBackupTimestamp), 'dd MMM yyyy, h:mm a')
    : 'Never';

  return (
    <>
      <Dialog
        open={open}
        onClose={progressState.inProgress ? undefined : onClose}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              borderRadius: '28px',
              p: 1,
              background: 'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(0, 245, 160, 0.12) 0%, rgba(15, 17, 24, 0.98) 100%)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.palette.background.glassBorder}`,
            },
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '14px',
                backgroundColor: 'rgba(0, 245, 160, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00F5A0',
              }}
            >
              <Cloud size={22} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk' }}>
                Google Drive Backup
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                AES-GCM encrypted cloud data sync
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} disabled={progressState.inProgress} sx={{ borderRadius: '12px' }}>
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ border: 'none', py: 1.5 }}>
          {alertMessage && (
            <Alert
              severity={alertMessage.type}
              onClose={() => setAlertMessage(null)}
              sx={{ mb: 2, borderRadius: '16px' }}
            >
              {alertMessage.text}
            </Alert>
          )}

          {progressState.inProgress && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 2.5,
                borderRadius: '20px',
                backgroundColor: 'rgba(0, 245, 160, 0.08)',
                border: '1px solid rgba(0, 245, 160, 0.3)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <CircularProgress size={20} color="primary" />
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#00F5A0' }}>
                  {progressState.message}
                </Typography>
              </Box>
              <LinearProgress color="primary" sx={{ borderRadius: 4, height: 6 }} />
            </Paper>
          )}

          {/* 1. Google Drive Account Connection Card (2 Rows Layout) */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mb: 2,
              borderRadius: '24px',
              background: theme.palette.background.glass,
              border: `1px solid ${theme.palette.background.glassBorder}`,
            }}
          >
            {/* Row 1: Icon + Title + Status Badge */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'nowrap' }}>
              {authInfo.connected ? (
                <Cloud size={22} color="#00F5A0" style={{ flexShrink: 0 }} />
              ) : (
                <CloudOff size={22} color={theme.palette.text.disabled} style={{ flexShrink: 0 }} />
              )}
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  fontFamily: 'Space Grotesk',
                  whiteSpace: 'nowrap',
                  color: theme.palette.text.primary,
                }}
              >
                Google Drive Access
              </Typography>
              <Chip
                label={authInfo.connected ? 'Connected' : 'Not Connected'}
                size="small"
                color={authInfo.connected ? 'success' : 'default'}
                variant="outlined"
                sx={{ fontWeight: 700, height: 22, fontSize: '0.7rem', ml: 'auto' }}
              />
            </Box>

            {/* Row 2: Subtitle/Email + Action Button */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mt: 1.5,
                pt: 1,
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                gap: 1.5,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {authInfo.connected
                  ? authInfo.userEmail || 'user@gmail.com'
                  : 'Authorize Vaulta to sync backups'}
              </Typography>

              {loadingAuth ? (
                <CircularProgress size={24} />
              ) : authInfo.connected ? (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={handleDisconnect}
                  disabled={progressState.inProgress}
                  sx={{
                    borderRadius: '14px',
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 2,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  Disconnect
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleConnect}
                  sx={{
                    borderRadius: '14px',
                    textTransform: 'none',
                    fontWeight: 800,
                    backgroundColor: '#00F5A0',
                    color: '#0B0E17',
                    px: 2,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    '&:hover': { backgroundColor: '#00D68B' },
                  }}
                >
                  Connect Drive
                </Button>
              )}
            </Box>
          </Paper>

          {/* 2. Automatic Backup Configuration */}
          {authInfo.connected && (
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                mb: 2,
                borderRadius: '24px',
                background: theme.palette.background.glass,
                border: `1px solid ${theme.palette.background.glassBorder}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Automatic Cloud Backup
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Sync in background without app interruptions
                  </Typography>
                </Box>
                <Switch
                  checked={driveConfig.autoBackup}
                  onChange={(e) => handleToggleAutoBackup(e.target.checked)}
                  color="primary"
                />
              </Box>

              <Divider sx={{ my: 1.5 }} />

              <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.text.secondary, mb: 1, display: 'block' }}>
                Backup Frequency
              </Typography>
              <RadioGroup
                value={driveConfig.interval}
                onChange={(e) => handleIntervalChange(e.target.value as BackupInterval)}
                sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}
              >
                <FormControlLabel value="manual" control={<Radio size="small" />} label="Manual only" />
                <FormControlLabel value="daily" control={<Radio size="small" />} label="Daily" />
                <FormControlLabel value="weekly" control={<Radio size="small" />} label="Weekly" />
                <FormControlLabel value="monthly" control={<Radio size="small" />} label="Monthly" />
              </RadioGroup>

              <Divider sx={{ my: 1.5 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Wifi size={18} color={theme.palette.text.secondary} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Backup only on Wi-Fi
                  </Typography>
                </Box>
                <Switch
                  checked={driveConfig.wifiOnly}
                  onChange={(e) => handleWifiToggle(e.target.checked)}
                  size="small"
                  color="primary"
                />
              </Box>
            </Paper>
          )}

          {/* 3. Last Backup Status & Manual Actions */}
          {authInfo.connected && (
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '24px',
                background: theme.palette.background.glass,
                border: `1px solid ${theme.palette.background.glassBorder}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Clock size={18} color={theme.palette.primary.main} />
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Last backup:
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk', color: '#00F5A0' }}>
                  {lastBackupText}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<UploadCloud size={18} />}
                  onClick={handleBackupNow}
                  disabled={progressState.inProgress}
                  sx={{
                    py: 1.2,
                    borderRadius: '16px',
                    fontWeight: 800,
                    backgroundColor: theme.palette.primary.main,
                    color: '#0B0E17',
                    '&:hover': { backgroundColor: '#00D68B' },
                  }}
                >
                  Backup now
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Download size={18} />}
                  onClick={() => setConfirmRestoreOpen(true)}
                  disabled={progressState.inProgress}
                  sx={{
                    py: 1.2,
                    borderRadius: '16px',
                    fontWeight: 800,
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  }}
                >
                  Restore backup
                </Button>
              </Box>
            </Paper>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Overwrite Modal for Cloud Restore */}
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
            Restoring from Google Drive will replace all current transactions, categories, and accounts with the encrypted backup version stored in cloud.
          </Typography>
          <Typography variant="caption" sx={{ color: '#EB5757', fontWeight: 700 }}>
            This action cannot be undone. Are you sure you want to proceed?
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
    </>
  );
};

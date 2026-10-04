import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Grid,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Lock, Delete, KeyRound } from 'lucide-react';
import { useHaptics } from '../../hooks/useHaptics';

interface AppLockScreenProps {
  onUnlock: (pin: string) => boolean;
  onResetPin?: () => void;
}

export const AppLockScreen: React.FC<AppLockScreenProps> = ({ onUnlock, onResetPin }) => {
  const theme = useTheme();
  const haptics = useHaptics();
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [resetDialogOpen, setResetDialogOpen] = useState<boolean>(false);

  const handleKeyPress = (num: string) => {
    haptics.impactLight();
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        const success = onUnlock(nextPin);
        if (!success) {
          haptics.notifyError();
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 600);
        } else {
          haptics.notifySuccess();
        }
      }
    }
  };

  const handleDelete = () => {
    haptics.impactLight();
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleConfirmReset = () => {
    haptics.notifySuccess();
    setResetDialogOpen(false);
    if (onResetPin) {
      onResetPin();
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Box
          sx={{
            width: 68,
            height: 68,
            borderRadius: '50%',
            backgroundColor: `${theme.palette.primary.main}20`,
            color: theme.palette.primary.main,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            boxShadow: `0 0 25px ${theme.palette.primary.main}30`,
          }}
        >
          <Lock size={32} />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk', mb: 1, color: theme.palette.text.primary }}>
          Vaulta Locked
        </Typography>

        <Typography variant="body2" sx={{ color: error ? theme.palette.error.main : theme.palette.text.secondary, fontWeight: 600 }}>
          {error ? 'Incorrect PIN. Try again.' : 'Enter your 4-digit PIN'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
          {[0, 1, 2, 3].map((idx) => (
            <Box
              key={idx}
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor:
                  pin.length > idx
                    ? theme.palette.primary.main
                    : theme.palette.background.surfaceContainerHighest,
                boxShadow: pin.length > idx ? `0 0 10px ${theme.palette.primary.main}` : 'none',
                transition: 'all 0.2s ease',
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Keypad numbers formatted as 100% circular buttons */}
      <Box sx={{ maxWidth: 300, width: '100%', mx: 'auto' }}>
        <Grid container spacing={2} sx={{ justifyContent: 'center', alignItems: 'center' }}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <Grid key={num} size={{ xs: 4 }} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                onClick={() => handleKeyPress(num)}
                sx={{
                  width: 68,
                  height: 68,
                  minWidth: 68,
                  borderRadius: '50%',
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  fontFamily: 'Space Grotesk',
                  color: theme.palette.text.primary,
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: theme.palette.mode === 'light' ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease',
                  '&:active': {
                    transform: 'scale(0.92)',
                    backgroundColor: theme.palette.primary.main,
                    color: '#0B0E17',
                  },
                }}
              >
                {num}
              </Button>
            </Grid>
          ))}
          <Grid size={{ xs: 4 }} sx={{ display: 'flex', justifyContent: 'center' }} />
          <Grid size={{ xs: 4 }} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              onClick={() => handleKeyPress('0')}
              sx={{
                width: 68,
                height: 68,
                minWidth: 68,
                borderRadius: '50%',
                fontSize: '1.6rem',
                fontWeight: 800,
                fontFamily: 'Space Grotesk',
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.palette.mode === 'light' ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease',
                '&:active': {
                  transform: 'scale(0.92)',
                  backgroundColor: theme.palette.primary.main,
                  color: '#0B0E17',
                },
              }}
            >
              0
            </Button>
          </Grid>
          <Grid size={{ xs: 4 }} sx={{ display: 'flex', justifyContent: 'center' }}>
            <IconButton
              onClick={handleDelete}
              sx={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                color: theme.palette.text.secondary,
                '&:active': {
                  transform: 'scale(0.92)',
                  color: theme.palette.error.main,
                },
              }}
            >
              <Delete size={24} />
            </IconButton>
          </Grid>
        </Grid>
      </Box>

      {/* Forgot PIN / Reset Passcode Link */}
      {onResetPin && (
        <Box sx={{ mt: 4 }}>
          <Button
            size="small"
            onClick={() => setResetDialogOpen(true)}
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 700,
              fontFamily: 'Space Grotesk',
              fontSize: '0.85rem',
              textTransform: 'none',
              '&:hover': { color: theme.palette.primary.main },
            }}
          >
            Forgot PIN? Reset Passcode
          </Button>
        </Box>
      )}

      {/* Reset Confirmation Modal */}
      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '24px',
              p: 1,
              backgroundColor: theme.palette.background.paper,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontFamily: 'Space Grotesk', display: 'flex', alignItems: 'center', gap: 1 }}>
          <KeyRound size={22} color={theme.palette.primary.main} />
          Reset Security Lock?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.5 }}>
            Forgot your PIN? Confirming reset will clear your security passcode so you can instantly regain access to Vaulta. You can set a new 4-digit PIN anytime in Settings.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setResetDialogOpen(false)} sx={{ color: theme.palette.text.secondary, fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmReset}
            sx={{
              backgroundColor: theme.palette.error.main,
              color: '#FFFFFF',
              fontWeight: 800,
              fontFamily: 'Space Grotesk',
              borderRadius: '14px',
            }}
          >
            Reset & Unlock
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

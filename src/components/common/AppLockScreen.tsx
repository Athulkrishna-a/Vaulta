import React, { useState } from 'react';
import { Box, Typography, Button, IconButton, Grid, useTheme } from '@mui/material';
import { Lock, Delete } from 'lucide-react';
import { useHaptics } from '../../hooks/useHaptics';

interface AppLockScreenProps {
  onUnlock: (pin: string) => boolean;
}

export const AppLockScreen: React.FC<AppLockScreenProps> = ({ onUnlock }) => {
  const theme = useTheme();
  const haptics = useHaptics();
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

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
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: `${theme.palette.primary.main}20`,
            color: theme.palette.primary.main,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <Lock size={32} />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          ExpenseTrack Locked
        </Typography>

        <Typography variant="body2" sx={{ color: error ? theme.palette.error.main : theme.palette.text.secondary }}>
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
                transition: 'background-color 0.2s ease',
              }}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ maxWidth: 280, width: '100%' }}>
        <Grid container spacing={2}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <Grid key={num} size={{ xs: 4 }}>
              <Button
                fullWidth
                onClick={() => handleKeyPress(num)}
                sx={{
                  height: 64,
                  borderRadius: '50%',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  backgroundColor: theme.palette.background.surfaceContainerHigh,
                  '&:active': {
                    backgroundColor: theme.palette.background.surfaceContainerHighest,
                  },
                }}
              >
                {num}
              </Button>
            </Grid>
          ))}
          <Grid size={{ xs: 4 }} />
          <Grid size={{ xs: 4 }}>
            <Button
              fullWidth
              onClick={() => handleKeyPress('0')}
              sx={{
                height: 64,
                borderRadius: '50%',
                fontSize: '1.5rem',
                fontWeight: 600,
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.background.surfaceContainerHigh,
              }}
            >
              0
            </Button>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <IconButton
              onClick={handleDelete}
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                color: theme.palette.text.secondary,
              }}
            >
              <Delete size={24} />
            </IconButton>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

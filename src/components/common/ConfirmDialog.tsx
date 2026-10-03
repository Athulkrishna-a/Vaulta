import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, useTheme } from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'error',
  onConfirm,
  onCancel,
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      slotProps={{
        paper: {
          sx: {
            borderRadius: '28px',
            p: 1.5,
            maxWidth: 380,
            background: 'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(255, 82, 82, 0.15) 0%, rgba(15, 17, 24, 0.98) 100%)',
            color: '#F4F6FC',
            border: '1.5px solid rgba(255, 82, 82, 0.35)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85), 0 0 24px rgba(255, 82, 82, 0.2)',
            backdropFilter: 'blur(25px)',
          },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, fontFamily: 'Space Grotesk', fontSize: '1.25rem', color: '#FFFFFF' }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: '#8A95AD', fontWeight: 500, fontFamily: 'Space Grotesk' }}>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2, gap: 1 }}>
        <Button
          onClick={onCancel}
          variant="text"
          sx={{
            color: '#8A95AD',
            fontWeight: 700,
            fontFamily: 'Space Grotesk',
            borderRadius: '14px',
            px: 2,
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={confirmColor}
          sx={{
            px: 3,
            py: 1,
            borderRadius: '14px',
            fontWeight: 800,
            fontFamily: 'Space Grotesk',
            boxShadow: '0 6px 18px rgba(255, 82, 82, 0.4)',
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

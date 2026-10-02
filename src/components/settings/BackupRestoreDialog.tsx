import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { Download, Upload, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import {
  createFullBackup,
  downloadJsonFile,
  validateBackupFile,
  restoreBackup,
  ValidationResult,
} from '../../utils/backupRestore';
import { exportTransactionsToCsv } from '../../utils/exportCsv';
import { useAppData } from '../../app/providers/AppDataProvider';
import { useHaptics } from '../../hooks/useHaptics';

interface BackupRestoreDialogProps {
  open: boolean;
  onClose: () => void;
}

export const BackupRestoreDialog: React.FC<BackupRestoreDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const haptics = useHaptics();
  const { transactions, categories, reloadAll } = useAppData();

  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [parsedPayload, setParsedPayload] = useState<any>(null);
  const [restoring, setRestoring] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleExportJson = async () => {
    haptics.impactMedium();
    const backup = await createFullBackup();
    const filename = `ExpenseTrack_Backup_${new Date().toISOString().substring(0, 10)}.json`;
    downloadJsonFile(backup, filename);
  };

  const handleExportCsv = () => {
    haptics.impactLight();
    exportTransactionsToCsv(transactions, categories);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const result = validateBackupFile(json);
        setValidationResult(result);
        if (result.valid) {
          setParsedPayload(json);
        }
      } catch (err) {
        setValidationResult({
          valid: false,
          errors: ['Failed to parse JSON file. File may be corrupted or invalid.'],
        });
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmRestore = async () => {
    if (!parsedPayload) return;
    setRestoring(true);
    haptics.impactHeavy();

    try {
      await restoreBackup(parsedPayload);
      await reloadAll();
      haptics.notifySuccess();
      setSuccessMessage('Data successfully restored!');
      setParsedPayload(null);
      setValidationResult(null);
    } catch (err) {
      haptics.notifyError();
      setValidationResult({
        valid: false,
        errors: ['An unexpected error occurred during database restoration.'],
      });
    } finally {
      setRestoring(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: { borderRadius: '28px', p: 1 },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800 }}>Backup & Restore</DialogTitle>

      <DialogContent>
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: '14px' }}>
            {successMessage}
          </Alert>
        )}

        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: theme.palette.text.secondary }}>
          EXPORT DATA
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Download size={18} />}
            onClick={handleExportJson}
            sx={{ borderRadius: '16px', py: 1.2 }}
          >
            Export JSON Backup
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileText size={18} />}
            onClick={handleExportCsv}
            sx={{ borderRadius: '16px', py: 1.2 }}
          >
            Export CSV Transactions
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: theme.palette.text.secondary }}>
          RESTORE FROM BACKUP
        </Typography>

        <Button
          component="label"
          variant="outlined"
          color="secondary"
          fullWidth
          startIcon={<Upload size={18} />}
          sx={{ borderRadius: '16px', py: 1.2, mb: 2 }}
        >
          Select JSON Backup File
          <input type="file" accept=".json" hidden onChange={handleFileSelect} />
        </Button>

        {validationResult && !validationResult.valid && (
          <Alert severity="error" icon={<AlertTriangle size={20} />} sx={{ borderRadius: '14px', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Backup Validation Failed
            </Typography>
            {validationResult.errors.map((err, i) => (
              <Typography key={i} variant="caption" sx={{ display: 'block' }}>
                • {err}
              </Typography>
            ))}
          </Alert>
        )}

        {validationResult && validationResult.valid && validationResult.summary && (
          <Box
            sx={{
              p: 2,
              borderRadius: '16px',
              backgroundColor: theme.palette.background.surfaceContainer,
              border: `1px solid ${theme.palette.primary.main}40`,
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CheckCircle size={20} color={theme.palette.success.main} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Valid Backup Found
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
              This backup contains:
            </Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>
              • <b>{validationResult.summary.transactionCount}</b> transactions
            </Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>
              • <b>{validationResult.summary.categoryCount}</b> categories
            </Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>
              • <b>{validationResult.summary.accountCount}</b> accounts
            </Typography>

            <Alert severity="warning" sx={{ mt: 2, borderRadius: '12px', fontSize: '0.78rem' }}>
              Warning: Restoring will overwrite existing data on this device.
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: theme.palette.text.secondary }}>
          Close
        </Button>
        {validationResult?.valid && (
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmRestore}
            disabled={restoring}
            startIcon={restoring ? <CircularProgress size={16} /> : undefined}
          >
            {restoring ? 'Restoring...' : 'Confirm Restore'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

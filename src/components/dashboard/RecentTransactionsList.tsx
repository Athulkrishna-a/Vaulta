import React, { useState } from 'react';
import { Box, Typography, Button, useTheme, Snackbar, Alert } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { TransactionItem } from '../transactions/TransactionItem';
import { useAppData } from '../../app/providers/AppDataProvider';
import { Transaction } from '../../types';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ReceiptText } from 'lucide-react';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useHaptics } from '../../hooks/useHaptics';

interface RecentTransactionsListProps {
  onEditTransaction: (transaction: Transaction) => void;
}

export const RecentTransactionsList: React.FC<RecentTransactionsListProps> = ({
  onEditTransaction,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const haptics = useHaptics();
  const { transactions, deleteTransaction, addTransaction } = useAppData();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletedTx, setDeletedTx] = useState<Transaction | null>(null);
  const [undoSnackbarOpen, setUndoSnackbarOpen] = useState<boolean>(false);

  const recentList = transactions.slice(0, 5);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    const target = transactions.find((t) => t.id === deleteId);
    if (target) {
      setDeletedTx(target);
      await deleteTransaction(deleteId);
      haptics.notifyWarning();
      setUndoSnackbarOpen(true);
    }
    setDeleteId(null);
  };

  const handleUndo = async () => {
    if (deletedTx) {
      const { id, createdAt, updatedAt, ...rest } = deletedTx;
      await addTransaction(rest);
      setDeletedTx(null);
      setUndoSnackbarOpen(false);
      haptics.notifySuccess();
    }
  };

  return (
    <GlassCard sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptText size={20} color={theme.palette.primary.main} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Recent Transactions
          </Typography>
        </Box>
        <Button
          size="small"
          endIcon={<ArrowRight size={16} />}
          onClick={() => navigate('/transactions')}
          sx={{ fontWeight: 700, color: theme.palette.primary.main }}
        >
          See All
        </Button>
      </Box>

      {recentList.length === 0 ? (
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: 'center', py: 3 }}>
          No transactions yet. Tap + to add your first expense or income!
        </Typography>
      ) : (
        <Box>
          {recentList.map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              onEdit={onEditTransaction}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </Box>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Transaction?"
        message="Are you sure you want to delete this transaction record?"
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />

      {/* Undo Snackbar */}
      <Snackbar
        open={undoSnackbarOpen}
        autoHideDuration={4000}
        onClose={() => setUndoSnackbarOpen(false)}
        message="Transaction deleted"
        action={
          <Button color="primary" size="small" onClick={handleUndo}>
            UNDO
          </Button>
        }
      />
    </GlassCard>
  );
};

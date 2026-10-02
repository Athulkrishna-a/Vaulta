import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, useTheme, Snackbar, Button } from '@mui/material';
import { TransactionFilterBar } from '../components/transactions/TransactionFilterBar';
import { TransactionItem } from '../components/transactions/TransactionItem';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useAppData } from '../app/providers/AppDataProvider';
import type { Transaction, FilterOptions } from '../types';
import { formatShortDate } from '../utils/dateUtils';
import { ReceiptText } from 'lucide-react';
import { useHaptics } from '../hooks/useHaptics';

interface TransactionsPageProps {
  onEditTransaction: (transaction: Transaction) => void;
  onOpenFastAdd: () => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  onEditTransaction,
  onOpenFastAdd,
}) => {
  const theme = useTheme();
  const haptics = useHaptics();
  const { filterTransactions, deleteTransaction, addTransaction } = useAppData();

  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    type: 'all',
    categoryId: 'all',
    sortBy: 'date_desc',
  });

  const [filteredList, setFilteredList] = useState<Transaction[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletedTx, setDeletedTx] = useState<Transaction | null>(null);
  const [undoSnackbarOpen, setUndoSnackbarOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    filterTransactions(filters).then((res) => {
      if (isMounted) setFilteredList(res);
    });
    return () => {
      isMounted = false;
    };
  }, [filters, filterTransactions]);

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filteredList.forEach((tx) => {
      const dateKey = formatShortDate(tx.date);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(tx);
    });
    return groups;
  }, [filteredList]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    const target = filteredList.find((t) => t.id === deleteId);
    if (target) {
      setDeletedTx(target);
      await deleteTransaction(deleteId);
      haptics.notifyWarning();
      setUndoSnackbarOpen(true);
      setFilteredList((prev) => prev.filter((t) => t.id !== deleteId));
    }
    setDeleteId(null);
  };

  const handleUndo = async () => {
    if (deletedTx) {
      const { id, createdAt, updatedAt, ...rest } = deletedTx;
      const restored = await addTransaction(rest);
      setDeletedTx(null);
      setUndoSnackbarOpen(false);
      setFilteredList((prev) => [restored, ...prev]);
      haptics.notifySuccess();
    }
  };

  return (
    <Box sx={{ p: 2, pb: 12 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
        Transaction History
      </Typography>

      <TransactionFilterBar filters={filters} onChange={setFilters} />

      {filteredList.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="No transactions found"
          description="Try adjusting your filter options or add a new transaction."
          actionText="Add Transaction"
          onAction={onOpenFastAdd}
        />
      ) : (
        <Box>
          {Object.entries(groupedTransactions).map(([dateGroup, items]) => (
            <Box key={dateGroup} sx={{ mb: 2.5 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  color: theme.palette.text.secondary,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  px: 1,
                  mb: 1,
                  display: 'block',
                }}
              >
                {dateGroup}
              </Typography>

              {items.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  onEdit={onEditTransaction}
                  onDelete={(id) => setDeleteId(id)}
                />
              ))}
            </Box>
          ))}
        </Box>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Transaction?"
        message="Are you sure you want to delete this transaction record?"
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />

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
    </Box>
  );
};

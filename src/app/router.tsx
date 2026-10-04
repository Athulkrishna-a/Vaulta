import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Box, useTheme } from '@mui/material';
import { App as CapacitorApp } from '@capacitor/app';
import { motion, AnimatePresence } from 'framer-motion';
import { HomePage } from '../pages/HomePage';
import { TransactionsPage } from '../pages/TransactionsPage';
import { StatisticsPage } from '../pages/StatisticsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { AccountsPage } from '../pages/AccountsPage';
import { InvestmentsPage } from '../pages/InvestmentsPage';
import { PaymentMethodsPage } from '../pages/PaymentMethodsPage';
import { InvestmentTypesPage } from '../pages/InvestmentTypesPage';
import { GoogleDriveBackupPage } from '../pages/GoogleDriveBackupPage';
import { SupabaseBackupPage } from '../pages/SupabaseBackupPage';
import { ManageAccountsPage } from '../pages/ManageAccountsPage';
import { BottomNav } from '../components/common/BottomNav';
import { TransactionFormSheet } from '../components/transactions/TransactionFormSheet';
import { Transaction, TransactionType } from '../types';

export const AppRouter: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const [fastAddOpen, setFastAddOpen] = useState<boolean>(false);
  const [fastAddType, setFastAddType] = useState<TransactionType | undefined>(undefined);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Scroll to top on route navigation (Request 7)
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  const handleOpenFastAdd = (defaultType?: TransactionType) => {
    setEditingTransaction(null);
    setFastAddType(defaultType);
    setFastAddOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setFastAddType(tx.type);
    setFastAddOpen(true);
  };

  const handleCloseSheet = () => {
    setFastAddOpen(false);
    setEditingTransaction(null);
    setFastAddType(undefined);
  };

  // Listen for Widget / App Shortcut triggers (e.g. ?action=add_expense or #add-expense)
  useEffect(() => {
    const checkWidgetLaunch = () => {
      const search = window.location.search;
      const hash = window.location.hash;
      if (search.includes('action=add_expense') || hash === '#add-expense' || hash === '#add') {
        handleOpenFastAdd();
      }
    };

    checkWidgetLaunch();

    // Capacitor native App launch intent listener
    let listenerHandler: any = null;
    CapacitorApp.addListener('appUrlOpen', (data) => {
      if (data.url.includes('add_expense') || data.url.includes('add')) {
        handleOpenFastAdd();
      }
    }).then((h) => {
      listenerHandler = h;
    });

    return () => {
      if (listenerHandler) {
        listenerHandler.remove();
      }
    };
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', backgroundColor: theme.palette.background.default, color: theme.palette.text.primary, overflowX: 'hidden', transition: 'background-color 0.25s ease' }}>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: [0.25, 1, 0.5, 1] }}
          style={{ minHeight: '100vh', width: '100%' }}
        >
          <Routes location={location}>
            <Route path="/" element={<HomePage onEditTransaction={handleEditTransaction} />} />
            <Route
              path="/transactions"
              element={
                <TransactionsPage
                  onEditTransaction={handleEditTransaction}
                  onOpenFastAdd={handleOpenFastAdd}
                />
              }
            />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route
              path="/investments"
              element={
                <InvestmentsPage
                  onEditTransaction={handleEditTransaction}
                  onOpenAddInvestment={handleOpenFastAdd}
                />
              }
            />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/payment-methods" element={<PaymentMethodsPage />} />
            <Route path="/investment-types" element={<InvestmentTypesPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/manage-accounts" element={<ManageAccountsPage />} />
            <Route path="/google-drive-backup" element={<GoogleDriveBackupPage />} />
            <Route path="/cloud-backup" element={<SupabaseBackupPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>

      <BottomNav onOpenFastAdd={() => handleOpenFastAdd()} />

      <TransactionFormSheet
        open={fastAddOpen}
        onClose={handleCloseSheet}
        initialData={editingTransaction}
        defaultType={fastAddType}
      />
    </Box>
  );
};

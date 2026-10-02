import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { App as CapacitorApp } from '@capacitor/app';
import { HomePage } from '../pages/HomePage';
import { TransactionsPage } from '../pages/TransactionsPage';
import { StatisticsPage } from '../pages/StatisticsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { AccountsPage } from '../pages/AccountsPage';
import { CalculatorPage } from '../pages/CalculatorPage';
import { InvestmentsPage } from '../pages/InvestmentsPage';
import { PaymentMethodsPage } from '../pages/PaymentMethodsPage';
import { InvestmentTypesPage } from '../pages/InvestmentTypesPage';
import { BottomNav } from '../components/common/BottomNav';
import { TransactionFormSheet } from '../components/transactions/TransactionFormSheet';
import { Transaction } from '../types';

export const AppRouter: React.FC = () => {
  const [fastAddOpen, setFastAddOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleOpenFastAdd = () => {
    setEditingTransaction(null);
    setFastAddOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setFastAddOpen(true);
  };

  const handleCloseSheet = () => {
    setFastAddOpen(false);
    setEditingTransaction(null);
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
    <Box sx={{ minHeight: '100vh', position: 'relative' }}>
      <Routes>
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
        <Route path="/calculator" element={<CalculatorPage />} />
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
      </Routes>

      <BottomNav onOpenFastAdd={handleOpenFastAdd} />

      <TransactionFormSheet
        open={fastAddOpen}
        onClose={handleCloseSheet}
        initialData={editingTransaction}
      />
    </Box>
  );
};

import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { AppDataProvider } from './providers/AppDataProvider';
import { AppThemeProvider } from './providers/ThemeProvider';
import { SecurityProvider } from './providers/SecurityProvider';
import { AppRouter } from './router';

export const App: React.FC = () => {
  useEffect(() => {
    // Capacitor native Android back button handling
    let backListener: any = null;

    const setupBackButton = async () => {
      try {
        backListener = await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
          if (canGoBack) {
            window.history.back();
          } else {
            CapacitorApp.minimizeApp();
          }
        });
      } catch (e) {
        // Fallback for browser environment
      }
    };

    setupBackButton();

    return () => {
      if (backListener) {
        backListener.remove();
      }
    };
  }, []);

  return (
    <BrowserRouter>
      <AppDataProvider>
        <AppThemeProvider>
          <SecurityProvider>
            <AppRouter />
          </SecurityProvider>
        </AppThemeProvider>
      </AppDataProvider>
    </BrowserRouter>
  );
};

export default App;

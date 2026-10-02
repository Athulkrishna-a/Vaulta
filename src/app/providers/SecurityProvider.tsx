

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAppData } from './AppDataProvider';
import { AppLockScreen } from '../../components/common/AppLockScreen';

interface SecurityContextType {
  isLocked: boolean;
  unlockApp: (pin: string) => boolean;
  lockApp: () => void;
  setPin: (pin: string) => Promise<void>;
  clearPin: () => Promise<void>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, updateSettings } = useAppData();
  const [isLocked, setIsLocked] = useState<boolean>(false);

  useEffect(() => {
    if (settings.securityLock && settings.pinHash) {
      setIsLocked(true);
    }
  }, [settings.securityLock, settings.pinHash]);

  const unlockApp = (inputPin: string): boolean => {
    // Simple hashed comparison for privacy
    if (btoa(inputPin) === settings.pinHash) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const lockApp = () => {
    if (settings.securityLock && settings.pinHash) {
      setIsLocked(true);
    }
  };

  const setPin = async (pin: string) => {
    const hash = btoa(pin);
    await updateSettings({ securityLock: true, pinHash: hash });
    setIsLocked(false);
  };

  const clearPin = async () => {
    await updateSettings({ securityLock: false, pinHash: undefined });
    setIsLocked(false);
  };

  return (
    <SecurityContext.Provider value={{ isLocked, unlockApp, lockApp, setPin, clearPin }}>
      {isLocked ? <AppLockScreen onUnlock={unlockApp} /> : children}
    </SecurityContext.Provider>
  );
};

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within SecurityProvider');
  }
  return context;
}

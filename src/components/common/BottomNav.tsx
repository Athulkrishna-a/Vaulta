import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction, Box, Fab, Tooltip } from '@mui/material';
import { Home, ListOrdered, BarChart2, Wallet, Plus, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHaptics } from '../../hooks/useHaptics';

interface BottomNavProps {
  onOpenFastAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenFastAdd }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const haptics = useHaptics(true);

  const currentPath = location.pathname;

  // Hide bottom navbar ONLY on sub-management pages
  const isHideNav = [
    '/categories',
    '/payment-methods',
    '/investment-types',
  ].includes(currentPath);

  if (isHideNav) return null;

  const handleNavChange = (_event: React.SyntheticEvent, newValue: string) => {
    haptics.impactLight();
    navigate(newValue);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        left: 0,
        right: 0,
        zIndex: 1100,
        display: 'flex',
        justifyContent: 'center',
        px: 2,
        pointerEvents: 'none',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        willChange: 'transform',
      }}
    >
      <Paper
        elevation={12}
        sx={{
          width: '100%',
          maxWidth: 420,
          borderRadius: '36px',
          background: 'linear-gradient(135deg, rgba(11, 14, 23, 0.94) 0%, rgba(6, 26, 16, 0.95) 100%)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          color: '#F0FDF4',
          border: '1.5px solid rgba(0, 245, 160, 0.3)',
          boxShadow: '0 16px 45px rgba(0, 0, 0, 0.75), 0 0 25px rgba(0, 245, 160, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          pointerEvents: 'auto',
          px: 1,
          py: 0.5,
          position: 'relative',
        }}
      >
        {/* Prominent Floating Action Button (+) centered with glowing cyber emerald gradient */}
        <Box
          sx={{
            position: 'absolute',
            top: -24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1200,
          }}
        >
          <Fab
            aria-label="Add Transaction"
            onClick={() => {
              haptics.impactMedium();
              onOpenFastAdd();
            }}
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00F5A0 0%, #C6FF2E 100%)',
              color: '#031C0C',
              boxShadow: '0 0 28px rgba(0, 245, 160, 0.65), 0 8px 24px rgba(0, 0, 0, 0.5)',
              transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateX(-50%) scale(1.06)',
                boxShadow: '0 0 34px rgba(0, 245, 160, 0.85)',
              },
              '&:active': {
                transform: 'scale(0.92)',
              },
            }}
          >
            <Plus size={28} strokeWidth={2.8} />
          </Fab>
        </Box>

        {/* 4 Perfectly Spaced Navigation Tabs (2 Left, 2 Right) */}
        <BottomNavigation
          value={currentPath}
          onChange={handleNavChange}
          showLabels={false}
          sx={{
            height: 54,
            backgroundColor: 'transparent',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 1,
            '& .MuiBottomNavigationAction-root': {
              minWidth: 0,
              flex: 1,
              color: '#70809A',
              padding: '6px 0',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&.Mui-selected': {
                color: '#00F5A0',
                transform: 'scale(1.2)',
                filter: 'drop-shadow(0 0 8px rgba(0, 245, 160, 0.6))',
              },
            },
          }}
        >
          {/* Left Tab 1: Home */}
          <BottomNavigationAction
            value="/"
            icon={<Home size={22} strokeWidth={2.2} />}
          />

          {/* Left Tab 2: Transaction History */}
          <BottomNavigationAction
            value="/transactions"
            icon={<ListOrdered size={22} strokeWidth={2.2} />}
          />

          {/* Center Gap for FAB (+) */}
          <Box sx={{ width: 56, flexShrink: 0 }} />

          {/* Right Tab 1: Analytics / Stats */}
          <BottomNavigationAction
            value="/statistics"
            icon={<BarChart2 size={22} strokeWidth={2.2} />}
          />

          {/* Right Tab 2: Accounts & Wallets */}
          <BottomNavigationAction
            value="/accounts"
            icon={<Wallet size={22} strokeWidth={2.2} />}
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

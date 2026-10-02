import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction, Box, Fab, Tooltip } from '@mui/material';
import { Home, ListOrdered, BarChart2, Settings, Plus, Calculator } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHaptics } from '../../hooks/useHaptics';

interface BottomNavProps {
  onOpenFastAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenFastAdd }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const haptics = useHaptics();

  const currentPath = location.pathname;

  // Hide bottom navbar on Settings page and settings sub-pages
  const isHideNav = [
    '/settings',
    '/categories',
    '/payment-methods',
    '/investment-types',
    '/accounts',
    '/calculator',
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
        elevation={10}
        sx={{
          width: '100%',
          maxWidth: 420,
          borderRadius: '36px',
          backgroundColor: 'rgba(18, 20, 28, 0.72)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          color: '#FFFFFF',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          pointerEvents: 'auto',
          px: 1,
          py: 0.5,
          position: 'relative',
        }}
      >
        {/* Prominent Floating Action Button (+) centered with glowing red ring */}
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
              backgroundColor: '#FF7675', // Coral Red matching mockup image
              color: '#FFFFFF',
              boxShadow: '0 0 24px rgba(255, 118, 117, 0.6), 0 8px 20px rgba(0, 0, 0, 0.3)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                backgroundColor: '#FF6B6B',
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
              color: '#8A92A6',
              padding: '6px 0',
              transition: 'color 0.2s ease, transform 0.2s ease',
              '&.Mui-selected': {
                color: '#00D1A7', // Glowing mint active color
                transform: 'scale(1.15)',
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

          {/* Right Tab 2: Settings */}
          <BottomNavigationAction
            value="/settings"
            icon={<Settings size={22} strokeWidth={2.2} />}
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

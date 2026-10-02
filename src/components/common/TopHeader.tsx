import React from 'react';
import { Box, Typography, IconButton, Avatar, useTheme } from '@mui/material';
import { Bell, Calculator, Settings, TrendingUp } from 'lucide-react';
import { getGreeting } from '../../utils/dateUtils';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const TopHeader: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const greeting = getGreeting();

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1.5,
        px: 2,
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(10, 14, 26, 0.85)' : 'rgba(244, 246, 248, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Avatar & Greeting */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          sx={{
            width: 44,
            height: 44,
            borderRadius: '16px',
            backgroundColor: theme.palette.primary.main,
            fontWeight: 800,
            fontSize: '1.1rem',
            boxShadow: '0 4px 12px rgba(108, 92, 231, 0.25)',
          }}
        >
          👤
        </Avatar>
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 600,
              display: 'block',
              fontSize: '0.72rem',
            }}
          >
            {greeting}!
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
              color: theme.palette.text.primary,
              lineHeight: 1.1,
              fontFamily: 'Space Grotesk',
            }}
          >
            Alex Morgan
          </Typography>
        </Box>
      </Box>

      {/* Header Shortcuts: Investments, Calculator & Settings */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          onClick={() => navigate('/investments')}
          title="Investments Portfolio"
          sx={{
            backgroundColor: theme.palette.background.paper,
            color: '#F1C40F',
            width: 42,
            height: 42,
            borderRadius: '14px',
            boxShadow: theme.palette.mode === 'light' ? '0 4px 12px rgba(0,0,0,0.03)' : 'none',
          }}
        >
          <TrendingUp size={20} />
        </IconButton>

        <IconButton
          onClick={() => navigate('/calculator')}
          title="Calculator"
          sx={{
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            width: 42,
            height: 42,
            borderRadius: '14px',
            boxShadow: theme.palette.mode === 'light' ? '0 4px 12px rgba(0,0,0,0.03)' : 'none',
          }}
        >
          <Calculator size={20} />
        </IconButton>

        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={() => navigate('/settings')}
            title="Settings"
            sx={{
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              width: 42,
              height: 42,
              borderRadius: '14px',
              boxShadow: theme.palette.mode === 'light' ? '0 4px 12px rgba(0,0,0,0.03)' : 'none',
            }}
          >
            <Settings size={20} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

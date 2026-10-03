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
        width: '100%',
        borderRadius: 0,
        pt: 'calc(env(safe-area-inset-top, 0px) + 34px)',
        pb: 1.5,
        px: 2,
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(15, 20, 32, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 245, 160, 0.15)',
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
            backgroundColor: '#00F5A0',
            color: '#0B0E17',
            fontWeight: 800,
            fontSize: '1.1rem',
            boxShadow: '0 4px 14px rgba(0, 245, 160, 0.35)',
          }}
        >
          👤
        </Avatar>
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: '#8A95AD',
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
              color: '#F4F6FC',
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
            backgroundColor: 'rgba(0, 245, 160, 0.1)',
            color: '#00F5A0',
            width: 42,
            height: 42,
            borderRadius: '14px',
            border: '1px solid rgba(0, 245, 160, 0.18)',
            '&:hover': { backgroundColor: 'rgba(0, 245, 160, 0.2)' },
          }}
        >
          <TrendingUp size={20} />
        </IconButton>

        <IconButton
          onClick={() => navigate('/calculator')}
          title="Calculator"
          sx={{
            backgroundColor: 'rgba(0, 245, 160, 0.1)',
            color: '#00F5A0',
            width: 42,
            height: 42,
            borderRadius: '14px',
            border: '1px solid rgba(0, 245, 160, 0.18)',
            '&:hover': { backgroundColor: 'rgba(0, 245, 160, 0.2)' },
          }}
        >
          <Calculator size={20} />
        </IconButton>

        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={() => navigate('/settings')}
            title="Settings"
            sx={{
              backgroundColor: 'rgba(0, 245, 160, 0.1)',
              color: '#00F5A0',
              width: 42,
              height: 42,
              borderRadius: '14px',
              border: '1px solid rgba(0, 245, 160, 0.18)',
              '&:hover': { backgroundColor: 'rgba(0, 245, 160, 0.2)' },
            }}
          >
            <Settings size={20} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

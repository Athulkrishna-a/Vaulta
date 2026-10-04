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
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 20, 32, 0.94)' : 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.2s ease',
      }}
    >
      {/* Avatar & Greeting */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          src="/gemini-svg.svg"
          alt="Vaulta Gemini Icon"
          sx={{
            width: 44,
            height: 44,
            borderRadius: '16px',
            backgroundColor: '#031C0C',
            border: '1.5px solid rgba(0, 245, 160, 0.4)',
            boxShadow: '0 4px 14px rgba(0, 245, 160, 0.35)',
            p: 0.5,
          }}
        />
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
            Hi. Athul
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

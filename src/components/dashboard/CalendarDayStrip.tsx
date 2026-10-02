import React, { useState } from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { format, addDays, startOfWeek } from 'date-fns';
import { useHaptics } from '../../hooks/useHaptics';

export const CalendarDayStrip: React.FC = () => {
  const theme = useTheme();
  const haptics = useHaptics();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Generate current week days
  const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday start
  const days = Array.from({ length: 7 }).map((_, i) => addDays(start, i));

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: '24px',
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.palette.mode === 'light' ? '0 4px 16px rgba(0, 0, 0, 0.03)' : 'none',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {days.map((d) => {
          const isSelected = format(d, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
          const dayInitial = format(d, 'EEEEE'); // M, T, W, T, F, S, S
          const dayNum = format(d, 'd');

          return (
            <Box
              key={d.toISOString()}
              onClick={() => {
                haptics.impactLight();
                setSelectedDate(d);
              }}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: 42,
                height: 56,
                borderRadius: '16px',
                cursor: 'pointer',
                backgroundColor: isSelected ? '#FF7675' : 'transparent', // Vivid orange pill matching Mockup 1
                color: isSelected ? '#FFFFFF' : theme.palette.text.secondary,
                transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
                '&:hover': {
                  backgroundColor: isSelected ? '#FF7675' : theme.palette.background.surfaceContainer,
                },
              }}
            >
              <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600, opacity: 0.8 }}>
                {dayInitial}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 0.2 }}>
                {dayNum}
              </Typography>
              {isSelected && (
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#FFF', mt: 0.3 }} />
              )}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Grid,
  useTheme,
} from '@mui/material';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, Check, RotateCcw } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, subDays, startOfYear, endOfYear, isSameDay, isWithinInterval, addMonths } from 'date-fns';
import { useHaptics } from '../../hooks/useHaptics';

interface CustomDatePickerModalProps {
  open: boolean;
  onClose: () => void;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  onApply: (startDate?: string, endDate?: string) => void;
}

export const CustomDatePickerModal: React.FC<CustomDatePickerModalProps> = ({
  open,
  onClose,
  startDate,
  endDate,
  onApply,
}) => {
  const theme = useTheme();
  const haptics = useHaptics();

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedStart, setSelectedStart] = useState<Date | null>(startDate ? new Date(startDate) : null);
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(endDate ? new Date(endDate) : null);

  useEffect(() => {
    if (open) {
      setSelectedStart(startDate ? new Date(startDate) : null);
      setSelectedEnd(endDate ? new Date(endDate) : null);
      if (startDate) {
        setCurrentMonth(new Date(startDate));
      } else {
        setCurrentMonth(new Date());
      }
    }
  }, [open, startDate, endDate]);

  const handlePrevMonth = () => {
    haptics.impactLight();
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    haptics.impactLight();
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const handleDayClick = (day: Date) => {
    haptics.impactLight();
    if (!selectedStart || (selectedStart && selectedEnd)) {
      // First click or reset: set start date
      setSelectedStart(day);
      setSelectedEnd(null);
    } else if (selectedStart && !selectedEnd) {
      // Second click: set end date (swap if end < start)
      if (day < selectedStart) {
        setSelectedEnd(selectedStart);
        setSelectedStart(day);
      } else {
        setSelectedEnd(day);
      }
    }
  };

  const handlePresetSelect = (preset: 'today' | 'yesterday' | 'last_7_days' | 'this_month' | 'last_month' | 'this_year') => {
    haptics.impactMedium();
    const today = new Date();

    if (preset === 'today') {
      setSelectedStart(today);
      setSelectedEnd(today);
      setCurrentMonth(today);
    } else if (preset === 'yesterday') {
      const yest = subDays(today, 1);
      setSelectedStart(yest);
      setSelectedEnd(yest);
      setCurrentMonth(yest);
    } else if (preset === 'last_7_days') {
      setSelectedStart(subDays(today, 6));
      setSelectedEnd(today);
      setCurrentMonth(today);
    } else if (preset === 'this_month') {
      setSelectedStart(startOfMonth(today));
      setSelectedEnd(endOfMonth(today));
      setCurrentMonth(today);
    } else if (preset === 'last_month') {
      const lastM = subMonths(today, 1);
      setSelectedStart(startOfMonth(lastM));
      setSelectedEnd(endOfMonth(lastM));
      setCurrentMonth(lastM);
    } else if (preset === 'this_year') {
      setSelectedStart(startOfYear(today));
      setSelectedEnd(endOfYear(today));
      setCurrentMonth(today);
    }
  };

  const handleClear = () => {
    haptics.notifyWarning();
    setSelectedStart(null);
    setSelectedEnd(null);
  };

  const handleSave = () => {
    haptics.notifySuccess();
    const formattedStart = selectedStart ? format(selectedStart, 'yyyy-MM-dd') : undefined;
    const formattedEnd = selectedEnd ? format(selectedEnd, 'yyyy-MM-dd') : formattedStart;
    onApply(formattedStart, formattedEnd);
    onClose();
  };

  // Calendar days calculation for current month view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDayOfWeek = monthStart.getDay(); // 0: Sun, 1: Mon, ...
  const daysInMonth = monthEnd.getDate();

  const daysArray: (Date | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: {
            borderRadius: '28px',
            backgroundColor: '#0F1118',
            color: '#FFFFFF',
            p: 1.5,
            border: '1px solid rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(25px)',
          },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, fontFamily: 'Space Grotesk', display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarIcon size={20} color="#8C7CFF" />
          <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk', fontSize: '1.1rem' }}>
            Custom Date Picker
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: '#8A92A6' }}>
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 1, pb: 1 }}>
        {/* Preset Shortcuts Chips */}
        <Box sx={{ display: 'flex', gap: 0.8, overflowX: 'auto', pb: 1, mb: 1.5, '::-webkit-scrollbar': { display: 'none' } }}>
          <Chip
            label="Today"
            size="small"
            onClick={() => handlePresetSelect('today')}
            sx={chipStyle}
          />
          <Chip
            label="Yesterday"
            size="small"
            onClick={() => handlePresetSelect('yesterday')}
            sx={chipStyle}
          />
          <Chip
            label="Last 7 Days"
            size="small"
            onClick={() => handlePresetSelect('last_7_days')}
            sx={chipStyle}
          />
          <Chip
            label="This Month"
            size="small"
            onClick={() => handlePresetSelect('this_month')}
            sx={chipStyle}
          />
          <Chip
            label="Last Month"
            size="small"
            onClick={() => handlePresetSelect('last_month')}
            sx={chipStyle}
          />
          <Chip
            label="This Year"
            size="small"
            onClick={() => handlePresetSelect('this_year')}
            sx={chipStyle}
          />
        </Box>

        {/* Selected Range Info Pills */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: '#8A92A6', fontWeight: 600, display: 'block', fontSize: '0.65rem' }}>
              FROM DATE
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk', color: selectedStart ? '#8C7CFF' : '#8A92A6' }}>
              {selectedStart ? format(selectedStart, 'dd MMM yyyy') : 'Select Start'}
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ color: '#8A92A6', fontWeight: 700 }}>
            ➔
          </Typography>

          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ color: '#8A92A6', fontWeight: 600, display: 'block', fontSize: '0.65rem' }}>
              TO DATE
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk', color: selectedEnd ? '#8C7CFF' : '#8A92A6' }}>
              {selectedEnd ? format(selectedEnd, 'dd MMM yyyy') : selectedStart ? format(selectedStart, 'dd MMM yyyy') : 'Select End'}
            </Typography>
          </Box>
        </Box>

        {/* Calendar Month Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, px: 0.5 }}>
          <IconButton size="small" onClick={handlePrevMonth} sx={{ color: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.06)' }}>
            <ChevronLeft size={18} />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk', letterSpacing: '0.03em' }}>
            {format(currentMonth, 'MMMM yyyy')}
          </Typography>
          <IconButton size="small" onClick={handleNextMonth} sx={{ color: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.06)' }}>
            <ChevronRight size={18} />
          </IconButton>
        </Box>

        {/* Weekday Header Row */}
        <Grid container spacing={0.5} sx={{ mb: 1, textAlign: 'center' }}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <Grid key={day} size={{ xs: 12 / 7 }}>
              <Typography variant="caption" sx={{ color: '#8A92A6', fontWeight: 700, fontSize: '0.7rem' }}>
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {/* Days Grid */}
        <Grid container spacing={0.5} sx={{ textAlign: 'center' }}>
          {daysArray.map((dateObj, idx) => {
            if (!dateObj) {
              return <Grid key={`empty-${idx}`} size={{ xs: 12 / 7 }} />;
            }

            const isStart = selectedStart && isSameDay(dateObj, selectedStart);
            const isEnd = selectedEnd && isSameDay(dateObj, selectedEnd);
            const isInRange =
              selectedStart &&
              selectedEnd &&
              isWithinInterval(dateObj, { start: selectedStart, end: selectedEnd });

            return (
              <Grid key={dateObj.toISOString()} size={{ xs: 12 / 7 }}>
                <Box
                  onClick={() => handleDayClick(dateObj)}
                  sx={{
                    height: 38,
                    borderRadius: isStart || isEnd ? '50%' : isInRange ? '8px' : '50%',
                    backgroundColor: isStart || isEnd ? '#6C5CE7' : isInRange ? 'rgba(108, 92, 231, 0.25)' : 'transparent',
                    color: isStart || isEnd ? '#FFFFFF' : isInRange ? '#8C7CFF' : '#D0D5E0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: isStart || isEnd ? 800 : isInRange ? 700 : 500,
                    fontSize: '0.82rem',
                    fontFamily: 'Space Grotesk',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: isSameDay(dateObj, new Date()) && !isStart && !isEnd ? '1px solid #6C5CE7' : 'none',
                    '&:hover': {
                      backgroundColor: isStart || isEnd ? '#6C5CE7' : 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  {dateObj.getDate()}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2, pt: 1, justifyContent: 'space-between' }}>
        <Button
          size="small"
          startIcon={<RotateCcw size={14} />}
          onClick={handleClear}
          sx={{ color: '#8A92A6', textTransform: 'none', fontWeight: 700 }}
        >
          Clear
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose} sx={{ color: '#8A92A6', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            startIcon={<Check size={16} />}
            sx={{
              borderRadius: '16px',
              backgroundColor: '#6C5CE7',
              color: '#FFFFFF',
              fontWeight: 800,
              fontFamily: 'Space Grotesk',
              px: 2.5,
              '&:hover': { backgroundColor: '#5B51D8' },
            }}
          >
            Apply Date Filter
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

const chipStyle = {
  borderRadius: '12px',
  backgroundColor: 'rgba(255, 255, 255, 0.06)',
  color: '#FFFFFF',
  fontWeight: 700,
  fontFamily: 'Space Grotesk',
  fontSize: '0.72rem',
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#6C5CE7' },
};

import React, { useState } from 'react';
import { Box, Typography, Button, Grid, Paper, useTheme } from '@mui/material';
import { Delete, RotateCcw } from 'lucide-react';
import { useHaptics } from '../hooks/useHaptics';

export const CalculatorPage: React.FC = () => {
  const theme = useTheme();
  const haptics = useHaptics();

  const [display, setDisplay] = useState<string>('0');
  const [equation, setEquation] = useState<string>('');

  const handleNumberInput = (digit: string) => {
    haptics.impactLight();
    if (display === '0' && digit !== '.') {
      setDisplay(digit);
    } else {
      if (digit === '.' && display.includes('.')) return;
      if (display.length >= 14) return;
      setDisplay((prev) => prev + digit);
    }
  };

  const handleClear = () => {
    haptics.impactMedium();
    setDisplay('0');
    setEquation('');
  };

  const handleBackspace = () => {
    haptics.impactLight();
    if (display.length > 1) {
      setDisplay((prev) => prev.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleOperator = (op: string) => {
    haptics.impactLight();
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handlePercentage = () => {
    haptics.impactLight();
    const num = parseFloat(display);
    if (!isNaN(num)) {
      setDisplay(String(num / 100));
    }
  };

  const handleEvaluate = () => {
    haptics.impactHeavy();
    try {
      const fullEq = equation + display;
      const sanitized = fullEq.replace(/×/g, '*').replace(/÷/g, '/');
      const result = new Function(`return (${sanitized})`)();
      
      // Format clean decimals
      const formattedResult = typeof result === 'number' && !isNaN(result)
        ? parseFloat(result.toFixed(6)).toString()
        : 'Error';

      setDisplay(formattedResult);
      setEquation('');
    } catch (e) {
      setDisplay('Error');
    }
  };

  return (
    <Box
      sx={{
        p: 2.5,
        pb: 14,
        minHeight: '100vh',
        backgroundColor: '#11141F',
        color: '#FFFFFF',
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk' }}>
          Standard Calculator
        </Typography>
        <Typography variant="caption" sx={{ color: '#8A92A6', fontWeight: 500 }}>
          Quick financial & expense math
        </Typography>
      </Box>

      {/* Retro Olive Green LCD Display Screen matching Mockup Image */}
      <Box
        sx={{
          borderRadius: '28px',
          p: 3,
          backgroundColor: '#8FA667',
          color: '#1A290E',
          boxShadow: 'inset 0 4px 14px rgba(0, 0, 0, 0.45), 0 8px 24px rgba(0, 0, 0, 0.35)',
          border: '4px solid #1E2333',
          mb: 3,
          position: 'relative',
          minHeight: 130,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            textAlign: 'right',
            fontWeight: 800,
            color: '#2A3C17',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontFamily: 'Space Grotesk',
          }}
        >
          {equation || 'Ready'}
        </Typography>

        <Typography
          variant="h3"
          sx={{
            textAlign: 'right',
            fontWeight: 900,
            fontFamily: 'Space Grotesk, monospace',
            letterSpacing: '-0.02em',
            color: '#152409',
            lineHeight: 1.1,
            fontSize: display.length > 10 ? '2rem' : '2.8rem',
            wordBreak: 'break-all',
          }}
        >
          {display}
        </Typography>
      </Box>

      {/* Dark Tactile Neumorphic Keypad Grid */}
      <Grid container spacing={1.8}>
        {/* Row 1 */}
        <Grid size={{ xs: 3 }}>
          <Button fullWidth onClick={handleClear} sx={calcBtnStyle('#FF5252')}>
            C
          </Button>
        </Grid>
        <Grid size={{ xs: 3 }}>
          <Button fullWidth onClick={handleBackspace} sx={calcBtnStyle('#FF7675')}>
            ⌫
          </Button>
        </Grid>
        <Grid size={{ xs: 3 }}>
          <Button fullWidth onClick={handlePercentage} sx={calcBtnStyle('#00B894')}>
            %
          </Button>
        </Grid>
        <Grid size={{ xs: 3 }}>
          <Button fullWidth onClick={() => handleOperator('÷')} sx={calcBtnStyle('#8C7CFF')}>
            ÷
          </Button>
        </Grid>

        {/* Row 2 */}
        <Grid size={{ xs: 3 }}>
          <Button fullWidth onClick={() => handleNumberInput('7')} sx={numKeyStyle}>
            7
          </Button>
        </Grid>
        <Grid size={{ xs: 3 }}>
          <Button fullWidth onClick={() => handleNumberInput('8')} sx={numKeyStyle}>
            8
          </Button>
        </Grid>
        <Grid size={{ xs: 3 }}>
          <Button fullWidth onClick={() => handleNumberInput('9')} sx={numKeyStyle}>
            9
          </Button>
        </Grid>
        <Grid size={{ xs: 3 }}>
          <Button fullWidth onClick={() => handleOperator('×')} sx={calcBtnStyle('#8C7CFF')}>
            ×
          </Button>
        </Grid>

        {/* Row 3 */}
        <Grid size={{ xs: 3 }}>
          <Button fullWidth onClick={() => handleNumberInput('4')} sx={numKeyStyle}>
            4
          </Button>
        </Grid>
        <Grid size={{ xs: 3 }}>
          <Button fullWidth onClick={() => handleNumberInput('5')} sx={numKeyStyle}>
            5
          </Button>
        </Grid>
        <Grid size={{ xs: 3 }}>
          <Button fullWidth onClick={() => handleNumberInput('6')} sx={numKeyStyle}>
            6
          </Button>
        </Grid>
        <Grid size={{ xs: 3 }}>
          <Button fullWidth onClick={() => handleOperator('-')} sx={calcBtnStyle('#8C7CFF')}>
            -
          </Button>
        </Grid>

        {/* Row 4 */}
        <Grid size={{ xs: 3 }}>
          <Button fullWidth onClick={() => handleNumberInput('1')} sx={numKeyStyle}>
            1
          </Button>
        </Grid>
        <Grid size={{ xs: 3 }}>
          <Button fullWidth onClick={() => handleNumberInput('2')} sx={numKeyStyle}>
            2
          </Button>
        </Grid>
        <Grid size={{ xs: 3 }}>
          <Button fullWidth onClick={() => handleNumberInput('3')} sx={numKeyStyle}>
            3
          </Button>
        </Grid>
        <Grid size={{ xs: 3 }}>
          <Button fullWidth onClick={() => handleOperator('+')} sx={calcBtnStyle('#8C7CFF')}>
            +
          </Button>
        </Grid>

        {/* Row 5 */}
        <Grid size={{ xs: 3 }}>
          <Button fullWidth onClick={() => handleNumberInput('00')} sx={numKeyStyle}>
            00
          </Button>
        </Grid>
        <Grid size={{ xs: 3 }}>
          <Button fullWidth onClick={() => handleNumberInput('0')} sx={numKeyStyle}>
            0
          </Button>
        </Grid>
        <Grid size={{ xs: 3 }}>
          <Button fullWidth onClick={() => handleNumberInput('.')} sx={numKeyStyle}>
            .
          </Button>
        </Grid>
        <Grid size={{ xs: 3 }}>
          <Button fullWidth onClick={handleEvaluate} sx={calcBtnStyle('#00B894', '#00B894')}>
            =
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

const numKeyStyle = {
  height: 62,
  borderRadius: '20px',
  fontSize: '1.4rem',
  fontWeight: 700,
  fontFamily: 'Space Grotesk',
  color: '#FFFFFF',
  backgroundColor: '#1B202F',
  boxShadow: '0 6px 14px rgba(0, 0, 0, 0.35)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  transition: 'transform 0.1s ease',
  '&:active': {
    transform: 'scale(0.95)',
    backgroundColor: '#151924',
  },
};

const calcBtnStyle = (color: string, bgColor?: string) => ({
  height: 62,
  borderRadius: '20px',
  fontSize: '1.3rem',
  fontWeight: 800,
  fontFamily: 'Space Grotesk',
  color: bgColor ? '#FFFFFF' : color,
  backgroundColor: bgColor || '#1B202F',
  boxShadow: '0 6px 14px rgba(0, 0, 0, 0.35)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  transition: 'transform 0.1s ease',
  '&:active': {
    transform: 'scale(0.95)',
  },
});

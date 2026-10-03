import React, { useState } from 'react';
import { Box, Typography, Grid, useTheme, Chip, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import {
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Wifi,
  ChevronsUpDown,
  Layers,
  TrendingUp,
  PieChart,
} from 'lucide-react';
import { CurrencyText } from '../common/CurrencyText';
import { formatMonthHeader } from '../../utils/dateUtils';
import { useAppData } from '../../app/providers/AppDataProvider';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useNavigate } from 'react-router-dom';

export const MonthSummaryCard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { totalBalance, totalInvestments, monthlySummary, activeMonth } = useAppData();
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0); // 0: Overall Balance, 1: VISA Expense, 2: Investment Portfolio

  const monthLabel = formatMonthHeader(activeMonth);

  const handleToggleCard = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // web fallback ignore
    }
    setActiveCardIndex((prev) => (prev + 1) % 3);
  };

  const handleDragEnd = (_: any, info: { offset: { y: number } }) => {
    if (Math.abs(info.offset.y) > 30) {
      handleToggleCard();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Stack Deck Navigation Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Layers size={16} color={theme.palette.primary.main} />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: 'text.secondary',
              textTransform: 'uppercase',
              fontSize: '0.72rem',
            }}
          >
            {activeCardIndex === 0
              ? '1 of 3 • Overall Total Balance'
              : activeCardIndex === 1
              ? '2 of 3 • Monthly Expense Card'
              : '3 of 3 • Total Investment Portfolio'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Deck Pagination Indicators */}
          <Box sx={{ display: 'flex', gap: 0.6 }}>
            {[0, 1, 2].map((idx) => (
              <Box
                key={idx}
                onClick={() => setActiveCardIndex(idx)}
                sx={{
                  width: activeCardIndex === idx ? 16 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor:
                    activeCardIndex === idx ? theme.palette.primary.main : theme.palette.action.disabled,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
              />
            ))}
          </Box>
          <IconButton size="small" onClick={handleToggleCard} sx={{ p: 0.5, color: 'text.secondary' }}>
            <ChevronsUpDown size={16} />
          </IconButton>
        </Box>
      </Box>

      {/* Stacked Cards Deck Area */}
      <Box sx={{ position: 'relative', height: 215, width: '100%', mb: 0.5, userSelect: 'none' }}>
        {/* CARD 1: Overall Total Balance Debit Card */}
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          onClick={handleToggleCard}
          animate={{
            y: activeCardIndex === 0 ? 0 : activeCardIndex === 1 ? 24 : 14,
            scale: activeCardIndex === 0 ? 1 : 0.92,
            zIndex: activeCardIndex === 0 ? 3 : 1,
            opacity: activeCardIndex === 0 ? 1 : 0.65,
          }}
          transition={{ type: 'spring', stiffness: 350, damping: 26 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '195px',
            borderRadius: '26px',
            cursor: 'pointer',
          }}
        >
          <Box
            sx={{
              height: '100%',
              borderRadius: '26px',
              p: 2.8,
              color: '#FFFFFF',
              background: 'linear-gradient(135deg, #1E1F2F 0%, #0D0E15 100%)',
              boxShadow:
                activeCardIndex === 0
                  ? '0 16px 36px rgba(0, 0, 0, 0.45)'
                  : '0 6px 16px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            {/* Metallic Purple Wavy Radial Background */}
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(108, 92, 231, 0.35) 0%, rgba(0,0,0,0) 70%)',
                pointerEvents: 'none',
              }}
            />

            {/* Top Row: Title, Contactless & Options */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.75)',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    fontSize: '0.68rem',
                  }}
                >
                  VAULT DEBIT
                </Typography>
                <Wifi size={14} style={{ transform: 'rotate(90deg)', opacity: 0.7 }} />
              </Box>
              <MoreHorizontal size={18} color="rgba(255, 255, 255, 0.6)" />
            </Box>

            {/* Middle Row: Overall Total Balance & Gold EMV Chip */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', my: 0.8 }}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.55)',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    display: 'block',
                    letterSpacing: '0.03em',
                  }}
                >
                  OVERALL TOTAL BALANCE
                </Typography>
                <CurrencyText
                  amount={totalBalance}
                  sx={{
                    fontSize: { xs: '2.0rem', sm: '2.3rem' },
                    fontWeight: 800,
                    color: '#FFFFFF',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                  }}
                />
              </Box>

              {/* Gold Metallic EMV Chip Visual */}
              <Box
                sx={{
                  width: 38,
                  height: 28,
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #FFE066 0%, #D4AF37 50%, #AA7C11 100%)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6)',
                }}
              >
                <Box
                  sx={{
                    width: '60%',
                    height: '50%',
                    border: '1px solid rgba(0,0,0,0.3)',
                    borderRadius: '2px',
                  }}
                />
              </Box>
            </Box>

            {/* Bottom Row: Card Details & Mastercard Logo */}
            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mt: 1.2 }}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    letterSpacing: '0.22em',
                    color: 'rgba(255, 255, 255, 0.65)',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    display: 'block',
                    mb: 0.3,
                  }}
                >
                  4582 •••• •••• 9012
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(255, 255, 255, 0.85)', fontWeight: 600, fontSize: '0.7rem' }}
                >
                  VAULTA MEMBER • OVERALL BAL
                </Typography>
              </Box>

              {/* Dual Mastercard Overlapping Circles */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#EB001B', opacity: 0.9 }} />
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    backgroundColor: '#F79E1B',
                    opacity: 0.9,
                    marginLeft: '-10px',
                  }}
                />
              </Box>
            </Box>
          </Box>
        </motion.div>

        {/* CARD 2: Monthly Expense VISA Card */}
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          onClick={handleToggleCard}
          animate={{
            y: activeCardIndex === 1 ? 0 : activeCardIndex === 2 ? 24 : 14,
            scale: activeCardIndex === 1 ? 1 : 0.92,
            zIndex: activeCardIndex === 1 ? 3 : 1,
            opacity: activeCardIndex === 1 ? 1 : 0.65,
          }}
          transition={{ type: 'spring', stiffness: 350, damping: 26 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '195px',
            borderRadius: '26px',
            cursor: 'pointer',
          }}
        >
          <Box
            sx={{
              height: '100%',
              borderRadius: '26px',
              p: 2.8,
              color: '#FFFFFF',
              background: 'linear-gradient(135deg, #0D2B45 0%, #1A1F38 50%, #2A0845 100%)',
              boxShadow:
                activeCardIndex === 1
                  ? '0 16px 36px rgba(108, 92, 231, 0.35)'
                  : '0 6px 16px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(0, 242, 254, 0.3)',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                bottom: -50,
                left: -50,
                width: 220,
                height: 220,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0, 242, 254, 0.25) 0%, rgba(0,0,0,0) 70%)',
                pointerEvents: 'none',
              }}
            />

            {/* Top Row: Title, Contactless & VISA Expense Badge */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="caption"
                  sx={{ color: '#00F2FE', fontWeight: 800, letterSpacing: '0.08em', fontSize: '0.68rem' }}
                >
                  VISA EXPENSE
                </Typography>
                <Wifi size={14} style={{ transform: 'rotate(90deg)', color: '#00F2FE', opacity: 0.85 }} />
              </Box>
              <Chip
                label="Monthly Spend"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(0, 242, 254, 0.15)',
                  color: '#00F2FE',
                  border: '1px solid rgba(0, 242, 254, 0.3)',
                }}
              />
            </Box>

            {/* Middle Row: Monthly Expense Spent & Silver EMV Chip */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', my: 0.8 }}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.65)',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    display: 'block',
                    letterSpacing: '0.03em',
                  }}
                >
                  EXPENSE SPENT ({monthLabel})
                </Typography>
                <CurrencyText
                  amount={monthlySummary.totalExpense}
                  sx={{
                    fontSize: { xs: '2.0rem', sm: '2.3rem' },
                    fontWeight: 800,
                    color: '#FF7675',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                  }}
                />
              </Box>

              <Box
                sx={{
                  width: 38,
                  height: 28,
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 50%, #757575 100%)',
                  border: '1px solid rgba(255,255,255,0.5)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8)',
                }}
              >
                <Box
                  sx={{
                    width: '60%',
                    height: '50%',
                    border: '1px solid rgba(0,0,0,0.3)',
                    borderRadius: '2px',
                  }}
                />
              </Box>
            </Box>

            {/* Bottom Row */}
            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mt: 1.2 }}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    letterSpacing: '0.22em',
                    color: 'rgba(255, 255, 255, 0.65)',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    display: 'block',
                    mb: 0.3,
                  }}
                >
                  4111 •••• •••• 5892
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(255, 255, 255, 0.85)', fontWeight: 600, fontSize: '0.7rem' }}
                >
                  VAULTA EXPENSE • 09/29
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontFamily: 'sans-serif',
                  fontWeight: 900,
                  fontStyle: 'italic',
                  fontSize: '1.45rem',
                  letterSpacing: '0.05em',
                  color: '#FFFFFF',
                  textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                  lineHeight: 1,
                  pr: 0.5,
                }}
              >
                VISA
              </Typography>
            </Box>
          </Box>
        </motion.div>

        {/* CARD 3: Gold Investment Portfolio Card */}
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          onClick={handleToggleCard}
          animate={{
            y: activeCardIndex === 2 ? 0 : activeCardIndex === 0 ? 24 : 14,
            scale: activeCardIndex === 2 ? 1 : 0.92,
            zIndex: activeCardIndex === 2 ? 3 : 1,
            opacity: activeCardIndex === 2 ? 1 : 0.65,
          }}
          transition={{ type: 'spring', stiffness: 350, damping: 26 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '195px',
            borderRadius: '26px',
            cursor: 'pointer',
          }}
        >
          <Box
            sx={{
              height: '100%',
              borderRadius: '26px',
              p: 2.8,
              color: '#FFFFFF',
              background: 'linear-gradient(135deg, #2D2605 0%, #171202 50%, #423204 100%)',
              boxShadow:
                activeCardIndex === 2
                  ? '0 16px 36px rgba(241, 196, 15, 0.3)'
                  : '0 6px 16px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(241, 196, 15, 0.4)',
            }}
          >
            {/* Gold Radial Glow */}
            <Box
              sx={{
                position: 'absolute',
                top: -40,
                right: -40,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(241, 196, 15, 0.35) 0%, rgba(0,0,0,0) 70%)',
                pointerEvents: 'none',
              }}
            />

            {/* Top Row: Title & Gold Badge */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="caption"
                  sx={{ color: '#F1C40F', fontWeight: 800, letterSpacing: '0.08em', fontSize: '0.68rem' }}
                >
                  INVESTMENT WEALTH
                </Typography>
                <TrendingUp size={14} color="#F1C40F" />
              </Box>
              <Chip
                label="Portfolio Active"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/investments');
                }}
                sx={{
                  height: 20,
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(241, 196, 15, 0.2)',
                  color: '#F1C40F',
                  border: '1px solid rgba(241, 196, 15, 0.4)',
                  cursor: 'pointer',
                }}
              />
            </Box>

            {/* Middle Row: Total Investment & Gold EMV Chip */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', my: 0.8 }}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.65)',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    display: 'block',
                    letterSpacing: '0.03em',
                  }}
                >
                  TOTAL INVESTED VALUE
                </Typography>
                <CurrencyText
                  amount={totalInvestments}
                  sx={{
                    fontSize: { xs: '2.0rem', sm: '2.3rem' },
                    fontWeight: 800,
                    color: '#F1C40F',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                  }}
                />
              </Box>

              <Box
                sx={{
                  width: 38,
                  height: 28,
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #FFE066 0%, #D4AF37 50%, #AA7C11 100%)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6)',
                }}
              >
                <Box
                  sx={{
                    width: '60%',
                    height: '50%',
                    border: '1px solid rgba(0,0,0,0.3)',
                    borderRadius: '2px',
                  }}
                />
              </Box>
            </Box>

            {/* Bottom Row */}
            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mt: 1.2 }}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    letterSpacing: '0.22em',
                    color: 'rgba(255, 255, 255, 0.65)',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    display: 'block',
                    mb: 0.3,
                  }}
                >
                  5542 •••• •••• 8890
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(255, 255, 255, 0.85)', fontWeight: 600, fontSize: '0.7rem' }}
                >
                  STOCKS • MUTUAL FUNDS • SIP
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontFamily: 'Space Grotesk',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  letterSpacing: '0.05em',
                  color: '#F1C40F',
                }}
              >
                GOLD
              </Typography>
            </Box>
          </Box>
        </motion.div>
      </Box>

      {/* 3-Card Summary Row: Total Balance, Expense, Investment (Equal Width & Height) */}
      <Grid container spacing={1.2} sx={{ alignItems: 'stretch' }}>
        {/* Overall Total Balance Card */}
        <Grid size={{ xs: 4 }} sx={{ display: 'flex' }}>
          <Box
            sx={{
              width: '100%',
              height: '100%',
              minHeight: 105,
              borderRadius: '20px',
              p: 1.5,
              boxSizing: 'border-box',
              backgroundColor: 'rgba(18, 24, 38, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(0, 245, 160, 0.18)',
              color: '#F4F6FC',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="caption" noWrap sx={{ fontWeight: 700, color: '#8A95AD', fontSize: '0.65rem' }}>
              Overall Balance
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <CurrencyText
                amount={totalBalance}
                sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#F4F6FC', display: 'block' }}
              />
              <Typography variant="caption" noWrap sx={{ color: '#8A95AD', fontSize: '0.62rem', display: 'block' }}>
                All Accounts
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Monthly Expense Card */}
        <Grid size={{ xs: 4 }} sx={{ display: 'flex' }}>
          <Box
            sx={{
              width: '100%',
              height: '100%',
              minHeight: 105,
              borderRadius: '20px',
              p: 1.5,
              boxSizing: 'border-box',
              backgroundColor: 'rgba(255, 82, 82, 0.15)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 82, 82, 0.3)',
              color: '#FF5252',
              boxShadow: '0 6px 16px rgba(255, 82, 82, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="caption" noWrap sx={{ fontWeight: 700, color: '#FF8A89', fontSize: '0.65rem' }}>
              Monthly Expense
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <CurrencyText
                amount={monthlySummary.totalExpense}
                sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#FF5252', display: 'block' }}
              />
              <Typography variant="caption" noWrap sx={{ color: '#FF8A89', fontSize: '0.62rem', display: 'block' }}>
                Spent ({monthLabel})
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Total Investment Card */}
        <Grid size={{ xs: 4 }} sx={{ display: 'flex' }}>
          <Box
            onClick={() => navigate('/investments')}
            sx={{
              width: '100%',
              height: '100%',
              minHeight: 105,
              borderRadius: '20px',
              p: 1.5,
              boxSizing: 'border-box',
              backgroundColor: 'rgba(255, 214, 0, 0.15)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 214, 0, 0.3)',
              color: '#FFD600',
              boxShadow: '0 6px 16px rgba(255, 214, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              '&:active': { transform: 'scale(0.97)' },
            }}
          >
            <Typography variant="caption" noWrap sx={{ fontWeight: 700, color: '#FFE566', fontSize: '0.65rem' }}>
              Total Investment
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <CurrencyText
                amount={totalInvestments}
                sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFD600', display: 'block' }}
              />
              <Typography variant="caption" noWrap sx={{ color: '#FFE566', fontSize: '0.62rem', display: 'block' }}>
                Portfolio Value ↗
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};


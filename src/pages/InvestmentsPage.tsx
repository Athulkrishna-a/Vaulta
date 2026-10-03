import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  IconButton,
  useTheme,
  Chip,
} from '@mui/material';
import { Plus, TrendingUp, PieChart as PieIcon, ShieldCheck, DollarSign, ChevronLeft } from 'lucide-react';
import { useAppData } from '../app/providers/AppDataProvider';
import { GlassCard } from '../components/common/GlassCard';
import { CurrencyText } from '../components/common/CurrencyText';
import { TransactionItem } from '../components/transactions/TransactionItem';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Transaction } from '../types';
import { useNavigate } from 'react-router-dom';
import { useHaptics } from '../hooks/useHaptics';

interface InvestmentsPageProps {
  onEditTransaction: (tx: Transaction) => void;
  onOpenAddInvestment: () => void;
}

const ASSET_COLORS: Record<string, string> = {
  Stocks: '#3498DB',
  'Mutual Funds': '#9B59B6',
  'Fixed Deposit': '#2ECC71',
  Gold: '#F1C40F',
  Crypto: '#E67E22',
  'Real Estate': '#E74C3C',
  SIP: '#1ABC9C',
  Other: '#95A5A6',
};

export const InvestmentsPage: React.FC<InvestmentsPageProps> = ({
  onEditTransaction,
  onOpenAddInvestment,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const haptics = useHaptics();
  const { transactions, totalInvestments, deleteTransaction } = useAppData();

  const investmentTxs = useMemo(() => {
    return transactions.filter((t) => t.type === 'investment');
  }, [transactions]);

  // Asset class breakdown calculations
  const assetBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    investmentTxs.forEach((t) => {
      const cat = t.investmentCategory || 'Mutual Funds';
      map.set(cat, (map.get(cat) || 0) + t.amount);
    });

    const result = Array.from(map.entries()).map(([name, value]) => ({
      name,
      value,
      color: ASSET_COLORS[name] || '#6C5CE7',
      percentage: totalInvestments > 0 ? Math.round((value / totalInvestments) * 100) : 0,
    }));

    return result.sort((a, b) => b.value - a.value);
  }, [investmentTxs, totalInvestments]);

  return (
    <Box sx={{ p: 2, pt: 'calc(env(safe-area-inset-top, 0px) + 24px)', pb: 14 }}>
      {/* Top Header with Back Arrow */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            onClick={() => {
              haptics.impactLight();
              navigate(-1);
            }}
            sx={{
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              width: 42,
              height: 42,
              borderRadius: '14px',
              border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
            }}
          >
            <ChevronLeft size={22} />
          </IconButton>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk' }}>
              Investment Portfolio
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Track wealth, stocks, SIPs & assets
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          size="small"
          startIcon={<Plus size={16} />}
          onClick={onOpenAddInvestment}
          sx={{
            borderRadius: '16px',
            backgroundColor: '#F1C40F',
            color: '#000000',
            fontWeight: 800,
            fontFamily: 'Space Grotesk',
            '&:hover': { backgroundColor: '#F39C12' },
          }}
        >
          Add Investment
        </Button>
      </Box>

      {/* Hero Portfolio Value Card */}
      <GlassCard
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #2D2605 0%, #171202 50%, #423204 100%)',
          color: '#FFFFFF',
          border: '1px solid rgba(241, 196, 15, 0.4)',
          boxShadow: '0 12px 30px rgba(241, 196, 15, 0.25)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" sx={{ color: '#F1C40F', fontWeight: 800, letterSpacing: '0.08em' }}>
            PORTFOLIO SUMMARY
          </Typography>
          <ShieldCheck size={20} color="#F1C40F" />
        </Box>

        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', mb: 0.5 }}>
          Total Value Invested Across Assets
        </Typography>

        <CurrencyText
          amount={totalInvestments}
          sx={{
            fontSize: '2.4rem',
            fontWeight: 800,
            color: '#F1C40F',
            fontFamily: 'Space Grotesk',
            letterSpacing: '-0.02em',
          }}
        />

        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={<TrendingUp size={14} color="#F1C40F" />}
            label={`${investmentTxs.length} Total Investments`}
            size="small"
            sx={{
              backgroundColor: 'rgba(241, 196, 15, 0.15)',
              color: '#F1C40F',
              fontWeight: 700,
              fontFamily: 'Space Grotesk',
            }}
          />
          <Chip
            icon={<PieIcon size={14} color="#FFF" />}
            label={`${assetBreakdown.length} Asset Classes`}
            size="small"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontFamily: 'Space Grotesk',
            }}
          />
        </Box>
      </GlassCard>

      {/* Asset Allocation Breakdown Donut Chart */}
      {assetBreakdown.length > 0 && (
        <GlassCard sx={{ p: 2.5, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, fontFamily: 'Space Grotesk' }}>
            Asset Allocation
          </Typography>

          <Box sx={{ height: 200, width: '100%', mb: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {assetBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: '#1E1F2F',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFF',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          {/* Allocation List */}
          <Grid container spacing={1.5}>
            {assetBreakdown.map((item) => (
              <Grid key={item.name} size={{ xs: 6 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '16px',
                    backgroundColor: theme.palette.background.surfaceContainer,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: item.color,
                      }}
                    />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                      {item.name}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: item.color }}>
                    {item.percentage}%
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </GlassCard>
      )}

      {/* Investment Transactions History */}
      <GlassCard sx={{ p: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, fontFamily: 'Space Grotesk' }}>
          Investment Records
        </Typography>

        {investmentTxs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <TrendingUp size={48} color={theme.palette.text.secondary} style={{ opacity: 0.5, marginBottom: 12 }} />
            <Typography variant="body1" sx={{ fontWeight: 700, mb: 0.5 }}>
              No investment entries yet
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 2 }}>
              Tap below to record your first Mutual Fund, Stock, or SIP entry.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={onOpenAddInvestment}
              sx={{ borderRadius: '14px' }}
            >
              Add First Investment
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {investmentTxs.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                onEdit={onEditTransaction}
                onDelete={(id) => deleteTransaction(id)}
              />
            ))}
          </Box>
        )}
      </GlassCard>
    </Box>
  );
};

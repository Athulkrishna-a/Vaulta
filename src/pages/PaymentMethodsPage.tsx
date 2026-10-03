import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
} from '@mui/material';
import { Plus, Edit2, Trash2, CreditCard, GripVertical, ChevronLeft } from 'lucide-react';
import { Reorder, useDragControls } from 'framer-motion';
import { useAppData } from '../app/providers/AppDataProvider';
import { GlassCard } from '../components/common/GlassCard';
import { useHaptics } from '../hooks/useHaptics';
import { useNavigate } from 'react-router-dom';

interface DraggablePaymentMethodCardProps {
  pm: string;
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

const DraggablePaymentMethodCard: React.FC<DraggablePaymentMethodCardProps> = ({ pm, index, onEdit, onDelete }) => {
  const theme = useTheme();
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={pm}
      id={pm}
      dragListener={false}
      dragControls={controls}
      style={{ listStyle: 'none', marginBottom: '12px' }}
      whileDrag={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', zIndex: 99 }}
    >
      <GlassCard sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              backgroundColor: `${theme.palette.primary.main}15`,
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CreditCard size={20} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk' }}>
            {pm}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
          {/* 2-line Drag & Drop Handle */}
          <IconButton
            size="small"
            onPointerDown={(e) => controls.start(e)}
            sx={{
              p: 0.6,
              color: theme.palette.text.secondary,
              cursor: 'grab',
              '&:active': { cursor: 'grabbing', color: theme.palette.primary.main },
              touchAction: 'none',
            }}
            title="Press and hold to drag & reorder"
          >
            <GripVertical size={18} />
          </IconButton>
          <IconButton size="small" onClick={() => onEdit(index)} sx={{ p: 0.5 }}>
            <Edit2 size={16} />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => onDelete(index)} sx={{ p: 0.5 }}>
            <Trash2 size={16} />
          </IconButton>
        </Box>
      </GlassCard>
    </Reorder.Item>
  );
};

export const PaymentMethodsPage: React.FC = () => {
  const theme = useTheme();
  const haptics = useHaptics();
  const navigate = useNavigate();
  const { paymentMethods, updatePaymentMethods } = useAppData();

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [methodName, setMethodName] = useState<string>('');

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setMethodName('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    setEditingIndex(index);
    setMethodName(paymentMethods[index]);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!methodName.trim()) return;
    haptics.impactMedium();

    const newMethods = [...paymentMethods];
    if (editingIndex !== null) {
      newMethods[editingIndex] = methodName.trim();
    } else {
      newMethods.push(methodName.trim());
    }

    await updatePaymentMethods(newMethods);
    setDialogOpen(false);
  };

  const handleDelete = async (index: number) => {
    haptics.notifyWarning();
    const newMethods = paymentMethods.filter((_, i) => i !== index);
    await updatePaymentMethods(newMethods);
  };

  const handleReorder = async (newMethods: string[]) => {
    haptics.impactLight();
    await updatePaymentMethods(newMethods);
  };

  return (
    <Box sx={{ p: 2, pt: 'calc(env(safe-area-inset-top, 0px) + 24px)', pb: 12 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0, flex: 1 }}>
          <IconButton
            onClick={() => {
              haptics.impactLight();
              navigate(-1);
            }}
            sx={{
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              width: 38,
              height: 38,
              borderRadius: '12px',
              border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
            }}
          >
            <ChevronLeft size={20} />
          </IconButton>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk' }}>
              Manage Payment Methods
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
              Press & hold 2-line handle to drag and reorder payment modes
            </Typography>
          </Box>
        </Box>

        {/* Top Right Add Icon Only */}
        <IconButton
          onClick={handleOpenAdd}
          sx={{
            width: 42,
            height: 42,
            borderRadius: '14px',
            backgroundColor: '#00F5A0',
            color: '#031C0C',
            boxShadow: '0 4px 14px rgba(0, 245, 160, 0.4)',
            '&:hover': { backgroundColor: '#00D68B' },
          }}
          title="Add Payment Method"
        >
          <Plus size={22} strokeWidth={2.5} />
        </IconButton>
      </Box>

      {/* Drag & Drop List of Payment Methods */}
      <Reorder.Group
        values={paymentMethods}
        onReorder={handleReorder}
        style={{ padding: 0, margin: 0, listStyle: 'none' }}
      >
        {paymentMethods.map((pm, idx) => (
          <DraggablePaymentMethodCard
            key={pm}
            pm={pm}
            index={idx}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
          />
        ))}
      </Reorder.Group>

      {/* Add / Edit Dialog with High-Contrast Vivid Dark Glass */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: {
              borderRadius: '28px',
              p: 1.5,
              background: 'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(0, 245, 160, 0.22) 0%, rgba(15, 20, 32, 0.98) 100%)',
              color: '#F4F6FC',
              border: '1.5px solid rgba(0, 245, 160, 0.4)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 245, 160, 0.25)',
              backdropFilter: 'blur(30px)',
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontFamily: 'Space Grotesk', fontSize: '1.25rem', color: '#00F5A0' }}>
          {editingIndex !== null ? 'Edit Payment Method' : 'Add Custom Payment Method'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Payment Method Name"
            placeholder="e.g. Amex Card / Paytm / Crypto Wallet"
            value={methodName}
            onChange={(e) => setMethodName(e.target.value)}
            sx={{
              my: 2,
              '& label': { color: '#8A95AD', fontWeight: 600 },
              '& input': { color: '#F4F6FC', fontWeight: 700, fontFamily: 'Space Grotesk' },
              '& .MuiOutlinedInput-root': {
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                '&.Mui-focused': { border: '1.5px solid #00F5A0' },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#8A95AD', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              borderRadius: '16px',
              backgroundColor: '#00F5A0',
              color: '#031C0C',
              fontWeight: 800,
              fontFamily: 'Space Grotesk',
              px: 3.5,
              py: 1,
              '&:hover': { backgroundColor: '#00D68B' },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

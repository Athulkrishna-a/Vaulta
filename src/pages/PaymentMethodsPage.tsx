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
    <Box sx={{ p: 2, pb: 12 }}>
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

        <Button
          variant="contained"
          size="small"
          startIcon={<Plus size={16} />}
          onClick={handleOpenAdd}
          sx={{ borderRadius: '16px', fontFamily: 'Space Grotesk', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          Add Method
        </Button>
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

      {/* Add / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{ paper: { sx: { borderRadius: '28px', p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingIndex !== null ? 'Edit Payment Method' : 'Add Custom Payment Method'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Payment Method Name"
            placeholder="e.g. Amex Card / Paytm / Crypto Wallet"
            value={methodName}
            onChange={(e) => setMethodName(e.target.value)}
            sx={{ my: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

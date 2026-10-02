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
import { Plus, Edit2, Trash2, TrendingUp, GripVertical, ChevronLeft } from 'lucide-react';
import { Reorder, useDragControls } from 'framer-motion';
import { useAppData } from '../app/providers/AppDataProvider';
import { GlassCard } from '../components/common/GlassCard';
import { useHaptics } from '../hooks/useHaptics';
import { useNavigate } from 'react-router-dom';

interface DraggableInvestmentTypeCardProps {
  invType: string;
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

const DraggableInvestmentTypeCard: React.FC<DraggableInvestmentTypeCardProps> = ({ invType, index, onEdit, onDelete }) => {
  const theme = useTheme();
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={invType}
      id={invType}
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
              backgroundColor: 'rgba(241, 196, 15, 0.15)',
              color: '#F1C40F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp size={20} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: 'Space Grotesk' }}>
            {invType}
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
              '&:active': { cursor: 'grabbing', color: '#F1C40F' },
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

export const InvestmentTypesPage: React.FC = () => {
  const theme = useTheme();
  const haptics = useHaptics();
  const navigate = useNavigate();
  const { investmentTypes, updateInvestmentTypes } = useAppData();

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [typeName, setTypeName] = useState<string>('');

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setTypeName('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    setEditingIndex(index);
    setTypeName(investmentTypes[index]);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!typeName.trim()) return;
    haptics.impactMedium();

    const newTypes = [...investmentTypes];
    if (editingIndex !== null) {
      newTypes[editingIndex] = typeName.trim();
    } else {
      newTypes.push(typeName.trim());
    }

    await updateInvestmentTypes(newTypes);
    setDialogOpen(false);
  };

  const handleDelete = async (index: number) => {
    haptics.notifyWarning();
    const newTypes = investmentTypes.filter((_, i) => i !== index);
    await updateInvestmentTypes(newTypes);
  };

  const handleReorder = async (newTypes: string[]) => {
    haptics.impactLight();
    await updateInvestmentTypes(newTypes);
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
              Manage Investment Types
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
              Press & hold 2-line handle to drag and reorder investment categories
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          size="small"
          startIcon={<Plus size={16} />}
          onClick={handleOpenAdd}
          sx={{
            borderRadius: '16px',
            backgroundColor: '#F1C40F',
            color: '#000000',
            fontWeight: 800,
            fontFamily: 'Space Grotesk',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            '&:hover': { backgroundColor: '#F39C12' },
          }}
        >
          Add Type
        </Button>
      </Box>

      {/* Drag & Drop List of Investment Types */}
      <Reorder.Group
        values={investmentTypes}
        onReorder={handleReorder}
        style={{ padding: 0, margin: 0, listStyle: 'none' }}
      >
        {investmentTypes.map((invType, idx) => (
          <DraggableInvestmentTypeCard
            key={invType}
            invType={invType}
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
          {editingIndex !== null ? 'Edit Investment Type' : 'Add Custom Investment Type'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Investment Asset Name"
            placeholder="e.g. Bonds / P2P Lending / Index Funds"
            value={typeName}
            onChange={(e) => setTypeName(e.target.value)}
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

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
  MenuItem,
  useTheme,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import { Plus, Edit2, Trash2, GripVertical, ChevronLeft } from 'lucide-react';
import { Reorder, useDragControls } from 'framer-motion';
import { Category } from '../types';
import { useAppData } from '../app/providers/AppDataProvider';
import { CategoryIcon } from '../components/common/CategoryIcon';
import { GlassCard } from '../components/common/GlassCard';
import { CATEGORY_COLORS } from '../theme/colors';
import { categoryRepository } from '../data/repositories/categoryRepository';
import { useHaptics } from '../hooks/useHaptics';
import { useNavigate } from 'react-router-dom';

const AVAILABLE_ICONS = [
  'Utensils', 'ShoppingBag', 'Car', 'Fuel', 'FileText', 'Home', 'Tv',
  'HeartPulse', 'GraduationCap', 'Plane', 'CreditCard', 'Smile', 'Landmark',
  'Briefcase', 'Laptop', 'Building', 'TrendingUp', 'PiggyBank', 'Gift', 'DollarSign'
];

interface DraggableCategoryCardProps {
  cat: Category;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
}

const DraggableCategoryCard: React.FC<DraggableCategoryCardProps> = ({ cat, onEdit, onDelete }) => {
  const theme = useTheme();
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={cat}
      id={cat.id}
      dragListener={false}
      dragControls={controls}
      style={{ listStyle: 'none', marginBottom: '12px' }}
      whileDrag={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', zIndex: 99 }}
    >
      <GlassCard sx={{ p: 1.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
          <CategoryIcon name={cat.icon} size={18} color="#FFF" backgroundColor={cat.color} />
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, fontSize: '0.85rem', fontFamily: 'Space Grotesk' }}>
            {cat.name}
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
          <IconButton size="small" onClick={() => onEdit(cat)} sx={{ p: 0.4 }}>
            <Edit2 size={14} />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => onDelete(cat)} sx={{ p: 0.4 }}>
            <Trash2 size={14} />
          </IconButton>
        </Box>
      </GlassCard>
    </Reorder.Item>
  );
};

export const CategoriesPage: React.FC = () => {
  const theme = useTheme();
  const haptics = useHaptics();
  const navigate = useNavigate();
  const { categories, addCategory, updateCategory, deleteCategory, reorderCategories } = useAppData();

  const [tab, setTab] = useState<'expense' | 'income'>('expense');
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [name, setName] = useState<string>('');
  const [icon, setIcon] = useState<string>('Tag');
  const [color, setColor] = useState<string>(CATEGORY_COLORS[0]);
  const [type, setType] = useState<'expense' | 'income'>('expense');

  // Delete protection states
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [assocCount, setAssocCount] = useState<number>(0);
  const [reassignId, setReassignId] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  const filtered = categories.filter((c) => c.type === tab || c.type === 'both');

  const handleReorder = (newFiltered: Category[]) => {
    haptics.impactLight();
    const nonFiltered = categories.filter((c) => c.type !== tab && c.type !== 'both');
    reorderCategories([...newFiltered, ...nonFiltered]);
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setIcon('Tag');
    setColor(CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)]);
    setType(tab);
    setDialogOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setIcon(cat.icon);
    setColor(cat.color);
    setType(cat.type as any);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    haptics.impactMedium();

    if (editingCategory) {
      await updateCategory({
        ...editingCategory,
        name: name.trim(),
        icon,
        color,
        type,
      });
    } else {
      await addCategory({
        name: name.trim(),
        icon,
        color,
        type,
      });
    }
    setDialogOpen(false);
  };

  const handleStartDelete = async (cat: Category) => {
    const count = await categoryRepository.countAssociatedTransactions(cat.id);
    setDeleteId(cat.id);
    setAssocCount(count);
    const other = categories.find((c) => c.id !== cat.id && (c.type === cat.type || c.type === 'both'));
    setReassignId(other ? other.id : '');
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    haptics.notifyWarning();
    await deleteCategory(deleteId, assocCount > 0 ? reassignId : undefined);
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  return (
    <Box sx={{ p: 2, pt: 'calc(env(safe-area-inset-top, 0px) + 24px)', pb: 12 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0, flex: 1 }}>
          <IconButton
            onClick={() => {
              haptics.impactLight();
              if (window.history.length > 1) navigate(-1);
              else navigate('/', { replace: true });
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
              Manage Categories
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
              Press & hold 2-line handle to drag and reorder
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
          title="Add Custom Category"
        >
          <Plus size={22} strokeWidth={2.5} />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, val) => setTab(val)}
        sx={{
          mb: 2.5,
          backgroundColor: theme.palette.background.surfaceContainerHigh,
          borderRadius: '16px',
          p: 0.5,
          '& .MuiTab-root': {
            borderRadius: '12px',
            fontWeight: 700,
            textTransform: 'none',
            flex: 1,
            '&.Mui-selected': {
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.primary.main,
            },
          },
        }}
      >
        <Tab value="expense" label="Expense Categories" />
        <Tab value="income" label="Income Categories" />
      </Tabs>

      {/* Drag and Drop Category List */}
      <Reorder.Group
        values={filtered}
        onReorder={handleReorder}
        style={{ padding: 0, margin: 0, listStyle: 'none' }}
      >
        {filtered.map((cat) => (
          <DraggableCategoryCard
            key={cat.id}
            cat={cat}
            onEdit={handleOpenEdit}
            onDelete={handleStartDelete}
          />
        ))}
      </Reorder.Group>

      {/* Add / Edit Category Dialog with High-Contrast Vivid Dark Glass & Grid Icon Picker */}
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
          {editingCategory ? 'Edit Category' : 'Add Custom Category'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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

          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.2, color: '#C6FF2E', letterSpacing: '0.04em' }}>
            SELECT ICON
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 1.2,
              maxHeight: 180,
              overflowY: 'auto',
              p: 1,
              mb: 2.5,
              borderRadius: '18px',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {AVAILABLE_ICONS.map((iconName) => {
              const isSelected = icon === iconName;
              return (
                <Box
                  key={iconName}
                  onClick={() => {
                    haptics.impactLight();
                    setIcon(iconName);
                  }}
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isSelected ? `${color}35` : 'rgba(255, 255, 255, 0.05)',
                    border: isSelected ? `2px solid ${color}` : '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: isSelected ? `0 0 14px ${color}80` : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      transform: 'scale(1.08)',
                      backgroundColor: `${color}25`,
                    },
                  }}
                >
                  <CategoryIcon name={iconName} size={20} color={isSelected ? color : '#C4D0E3'} />
                </Box>
              );
            })}
          </Box>

          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.2, color: '#C6FF2E', letterSpacing: '0.04em' }}>
            SELECT COLOR
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.2, flexWrap: 'wrap', p: 1, borderRadius: '18px', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            {CATEGORY_COLORS.map((c) => (
              <Box
                key={c}
                onClick={() => {
                  haptics.impactLight();
                  setColor(c);
                }}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: c,
                  cursor: 'pointer',
                  border: color === c ? '3px solid #FFF' : 'none',
                  boxShadow: color === c ? `0 0 14px ${c}` : 'none',
                  transition: 'transform 0.15s ease',
                  '&:hover': { transform: 'scale(1.15)' },
                }}
              />
            ))}
          </Box>
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
            Save Category
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation with Re-assignment Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: {
              borderRadius: '28px',
              p: 1.5,
              background: 'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(255, 82, 82, 0.2) 0%, rgba(15, 20, 32, 0.98) 100%)',
              color: '#F4F6FC',
              border: '1.5px solid rgba(255, 82, 82, 0.4)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(30px)',
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#FF5252', fontFamily: 'Space Grotesk' }}>Delete Category?</DialogTitle>
        <DialogContent>
          {assocCount > 0 ? (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ mb: 2, fontWeight: 700, color: '#FF7675' }}>
                This category is currently associated with {assocCount} transactions.
              </Typography>
              <Typography variant="body2" sx={{ mb: 1.5, color: '#C4D0E3' }}>
                Please select a category to re-assign those transactions to before deleting:
              </Typography>
              <TextField
                select
                fullWidth
                label="Re-assign Transactions To"
                value={reassignId}
                onChange={(e) => setReassignId(e.target.value)}
                size="small"
                sx={{
                  '& label': { color: '#8A95AD' },
                  '& .MuiOutlinedInput-root': { borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.06)', color: '#F4F6FC' },
                }}
              >
                {categories
                  .filter((c) => c.id !== deleteId)
                  .map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
              </TextField>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: '#C4D0E3', mt: 1 }}>
              Are you sure you want to delete this category?
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#8A95AD', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            sx={{ borderRadius: '14px', fontWeight: 800, fontFamily: 'Space Grotesk', px: 2.5 }}
          >
            Delete Category
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

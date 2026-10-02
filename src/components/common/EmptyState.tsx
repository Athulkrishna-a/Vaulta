import React from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import { LucideIcon, Plus } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 6,
        px: 3,
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '24px',
          backgroundColor: theme.palette.background.surfaceContainerHigh,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.palette.primary.main,
          mb: 2,
        }}
      >
        <Icon size={36} strokeWidth={1.8} />
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
        {title}
      </Typography>

      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, maxWidth: 280, mb: 3 }}>
        {description}
      </Typography>

      {actionText && onAction && (
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={onAction}
          sx={{ borderRadius: '20px', px: 3 }}
        >
          {actionText}
        </Button>
      )}
    </Box>
  );
};

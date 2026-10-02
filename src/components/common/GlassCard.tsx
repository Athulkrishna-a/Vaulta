import React from 'react';
import { Paper, PaperProps, useTheme } from '@mui/material';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface GlassCardProps extends PaperProps {
  blurAmount?: number;
  hoverEffect?: boolean;
  motionProps?: HTMLMotionProps<'div'>;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  blurAmount = 16,
  hoverEffect = false,
  sx,
  elevation = 0,
  motionProps,
  ...rest
}) => {
  const theme = useTheme();

  return (
    <Paper
      component={motionProps ? motion.div : 'div'}
      elevation={elevation}
      {...(motionProps as any)}
      sx={{
        borderRadius: '24px',
        background: theme.palette.background.glass,
        backdropFilter: `blur(${blurAmount}px)`,
        WebkitBackdropFilter: `blur(${blurAmount}px)`,
        border: `1px solid ${theme.palette.background.glassBorder}`,
        boxShadow:
          theme.palette.mode === 'light'
            ? '0 6px 20px rgba(0, 0, 0, 0.04)'
            : '0 6px 20px rgba(0, 0, 0, 0.3)',
        transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.2s cubic-bezier(0.2, 0, 0, 1)',
        ...(hoverEffect && {
          '&:active': {
            transform: 'scale(0.985)',
          },
        }),
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Paper>
  );
};

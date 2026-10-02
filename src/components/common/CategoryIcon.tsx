import React from 'react';
import * as Icons from 'lucide-react';
import { Box } from '@mui/material';

interface CategoryIconProps {
  name: string;
  color?: string;
  size?: number;
  backgroundColor?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  color = '#FFFFFF',
  size = 22,
  backgroundColor,
}) => {
  // Lucide icon dynamic lookup with fallback
  const IconComponent = (Icons as any)[name] || Icons.Tag;

  const content = <IconComponent size={size} color={color} strokeWidth={2.2} />;

  if (backgroundColor) {
    return (
      <Box
        sx={{
          width: size * 1.8,
          height: size * 1.8,
          borderRadius: '50%',
          backgroundColor,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
};

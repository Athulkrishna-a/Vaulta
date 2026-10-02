export const lightPalette = {
  mode: 'light' as const,
  primary: {
    main: '#6C5CE7', // Vibrant Purple/Violet primary like Mockups 1 & 2
    contrastText: '#FFFFFF',
    container: '#E0DFFF',
    onContainer: '#21005D',
  },
  secondary: {
    main: '#FF7675', // Vibrant Orange/Coral secondary
    contrastText: '#FFFFFF',
    container: '#FFE0E0',
    onContainer: '#410002',
  },
  tertiary: {
    main: '#00B894', // Emerald Green accent
    contrastText: '#FFFFFF',
    container: '#D4F8F0',
    onContainer: '#003915',
  },
  error: {
    main: '#FF5252',
    contrastText: '#FFFFFF',
    container: '#FFDAD6',
    onContainer: '#410002',
  },
  income: {
    main: '#00B894',
    contrastText: '#FFFFFF',
    container: '#E6F9F4',
    onContainer: '#004B3A',
  },
  expense: {
    main: '#FF7675',
    contrastText: '#FFFFFF',
    container: '#FFF0F0',
    onContainer: '#601410',
  },
  transfer: {
    main: '#6C5CE7',
    contrastText: '#FFFFFF',
    container: '#F0EEFF',
    onContainer: '#21005D',
  },
  background: {
    default: '#F5F7FA', // Soft light gray tint like mockup 1 & 3
    paper: '#FFFFFF',
    glass: 'rgba(255, 255, 255, 0.85)',
    glassBorder: 'rgba(230, 235, 240, 0.8)',
    surfaceContainer: '#F0F3F7',
    surfaceContainerHigh: '#E4E8EE',
    surfaceContainerHighest: '#D8DEE6',
  },
  text: {
    primary: '#1A1D26',
    secondary: '#6E7485',
    disabled: '#A0A6B5',
  },
  divider: 'rgba(220, 226, 235, 0.8)',
};

export const darkPalette = {
  mode: 'dark' as const,
  primary: {
    main: '#8C7CFF',
    contrastText: '#0E0D1B',
    container: '#332488',
    onContainer: '#E0DFFF',
  },
  secondary: {
    main: '#FF8A89',
    contrastText: '#2B0505',
    container: '#701A19',
    onContainer: '#FFE0E0',
  },
  tertiary: {
    main: '#00D1A7',
    contrastText: '#002B20',
    container: '#005944',
    onContainer: '#D4F8F0',
  },
  error: {
    main: '#FF6B6B',
    contrastText: '#410002',
    container: '#93000A',
    onContainer: '#FFDAD6',
  },
  income: {
    main: '#00D1A7',
    contrastText: '#002B20',
    container: '#004737',
    onContainer: '#D4F8F0',
  },
  expense: {
    main: '#FF8A89',
    contrastText: '#2B0505',
    container: '#6B1B1A',
    onContainer: '#FFE0E0',
  },
  transfer: {
    main: '#8C7CFF',
    contrastText: '#0E0D1B',
    container: '#332488',
    onContainer: '#E0DFFF',
  },
  background: {
    default: '#12141C',
    paper: '#1B1E2B',
    glass: 'rgba(27, 30, 43, 0.85)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    surfaceContainer: '#232738',
    surfaceContainerHigh: '#2B3045',
    surfaceContainerHighest: '#353C56',
  },
  text: {
    primary: '#F0F2F7',
    secondary: '#9CA3AF',
    disabled: '#6B7280',
  },
  divider: 'rgba(255, 255, 255, 0.1)',
};

export const CATEGORY_COLORS = [
  '#FF7675', '#6C5CE7', '#00B894', '#FDCB6E',
  '#E84393', '#00CEC9', '#0984E3', '#6C5CE7',
  '#FD79A8', '#55EFC4', '#FAB1A0', '#A29BFE'
];

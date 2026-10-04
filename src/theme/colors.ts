export const lightPalette = {
  mode: 'light' as const,
  primary: {
    main: '#00B36B', // Crisp Emerald Green for Light Mode
    contrastText: '#FFFFFF',
    container: '#D4F8E8',
    onContainer: '#04341B',
  },
  secondary: {
    main: '#651FFF', // Electric Violet
    contrastText: '#FFFFFF',
    container: '#EDE7F6',
    onContainer: '#1A0066',
  },
  tertiary: {
    main: '#F57F17', // Gold Amber
    contrastText: '#FFFFFF',
    container: '#FFFDE7',
    onContainer: '#332B00',
  },
  error: {
    main: '#D32F2F',
    contrastText: '#FFFFFF',
    container: '#FFDAD6',
    onContainer: '#410002',
  },
  income: {
    main: '#00B36B',
    contrastText: '#FFFFFF',
    container: 'rgba(0, 179, 107, 0.12)',
    onContainer: '#04341B',
  },
  expense: {
    main: '#D32F2F',
    contrastText: '#FFFFFF',
    container: 'rgba(211, 47, 47, 0.12)',
    onContainer: '#D32F2F',
  },
  transfer: {
    main: '#651FFF',
    contrastText: '#FFFFFF',
    container: 'rgba(101, 31, 255, 0.12)',
    onContainer: '#651FFF',
  },
  background: {
    default: '#F4F6FC', // Clean Light Background
    paper: '#FFFFFF',    // Pure White Card Surface
    glass: 'rgba(255, 255, 255, 0.92)',
    glassBorder: 'rgba(0, 179, 107, 0.2)',
    surfaceContainer: '#EDF2F7',
    surfaceContainerHigh: '#E2E8F0',
    surfaceContainerHighest: '#CBD5E1',
  },
  text: {
    primary: '#0B0E17',   // Crisp Dark Text
    secondary: '#475569', // Soft Slate Gray Text
    disabled: '#94A3B8',
  },
  divider: 'rgba(0, 0, 0, 0.08)',
};

export const darkPalette = {
  mode: 'dark' as const,
  primary: {
    main: '#00F5A0', // Cyber Neon Emerald
    contrastText: '#0B0E17',
    container: '#0A3B25',
    onContainer: '#00F5A0',
  },
  secondary: {
    main: '#7C4DFF', // Electric Violet
    contrastText: '#FFFFFF',
    container: '#2C1B5E',
    onContainer: '#D1C4E9',
  },
  tertiary: {
    main: '#FFD600', // Cyber Gold
    contrastText: '#0B0E17',
    container: '#423800',
    onContainer: '#FFD600',
  },
  error: {
    main: '#FF5252',
    contrastText: '#FFFFFF',
    container: '#6B1B1A',
    onContainer: '#FFDAD6',
  },
  income: {
    main: '#00F5A0',
    contrastText: '#0B0E17',
    container: 'rgba(0, 245, 160, 0.18)',
    onContainer: '#00F5A0',
  },
  expense: {
    main: '#FF5252',
    contrastText: '#FFFFFF',
    container: 'rgba(255, 82, 82, 0.2)',
    onContainer: '#FF8A89',
  },
  transfer: {
    main: '#7C4DFF',
    contrastText: '#FFFFFF',
    container: 'rgba(124, 77, 255, 0.2)',
    onContainer: '#B388FF',
  },
  background: {
    default: '#0B0E17', // Midnight Deep Obsidian
    paper: 'rgba(18, 24, 38, 0.85)',
    glass: 'rgba(14, 19, 31, 0.8)',
    glassBorder: 'rgba(0, 245, 160, 0.15)',
    surfaceContainer: '#121724',
    surfaceContainerHigh: '#182030',
    surfaceContainerHighest: '#202A3E',
  },
  text: {
    primary: '#F4F6FC', // Clean Crisp Tint White
    secondary: '#8A95AD', // Soft Steel Silver
    disabled: '#535F7A',
  },
  divider: 'rgba(0, 245, 160, 0.14)',
};

export const CATEGORY_COLORS = [
  '#00F5A0', '#FF5252', '#7C4DFF', '#FFD600',
  '#00E5FF', '#FF4081', '#76FF03', '#FF9100',
  '#E040FB', '#1DE9B6', '#FF6E40', '#A7FF3D'
];

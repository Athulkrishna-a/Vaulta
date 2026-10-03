export const lightPalette = {
  mode: 'light' as const,
  primary: {
    main: '#00E676', // Cyber Emerald Green
    contrastText: '#0B0E17',
    container: '#D4F8E8',
    onContainer: '#0B0E17',
  },
  secondary: {
    main: '#7C4DFF', // Vibrant Electric Violet
    contrastText: '#FFFFFF',
    container: '#EDE7F6',
    onContainer: '#1A0066',
  },
  tertiary: {
    main: '#FFD600', // Cyber Gold
    contrastText: '#0B0E17',
    container: '#FFFDE7',
    onContainer: '#332B00',
  },
  error: {
    main: '#FF5252',
    contrastText: '#FFFFFF',
    container: '#FFDAD6',
    onContainer: '#410002',
  },
  income: {
    main: '#00E676',
    contrastText: '#0B0E17',
    container: 'rgba(0, 230, 118, 0.18)',
    onContainer: '#0B0E17',
  },
  expense: {
    main: '#FF5252',
    contrastText: '#FFFFFF',
    container: 'rgba(255, 82, 82, 0.18)',
    onContainer: '#FF5252',
  },
  transfer: {
    main: '#7C4DFF',
    contrastText: '#FFFFFF',
    container: 'rgba(124, 77, 255, 0.18)',
    onContainer: '#7C4DFF',
  },
  background: {
    default: '#0B0E17',
    paper: 'rgba(18, 24, 38, 0.82)',
    glass: 'rgba(15, 20, 32, 0.78)',
    glassBorder: 'rgba(0, 230, 118, 0.16)',
    surfaceContainer: '#121724',
    surfaceContainerHigh: '#182030',
    surfaceContainerHighest: '#202A3E',
  },
  text: {
    primary: '#F4F6FC',
    secondary: '#8A95AD',
    disabled: '#535F7A',
  },
  divider: 'rgba(0, 230, 118, 0.14)',
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

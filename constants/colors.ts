export const Colors = {
  // Backgrounds
  background: '#070C18',
  backgroundSecondary: '#0C1428',
  card: '#0D1526',
  cardLight: '#131D30',

  // Neon Accents
  purple: '#8B5CF6',
  purpleLight: '#A78BFA',
  purpleDark: '#6D28D9',
  pink: '#EC4899',
  pinkLight: '#F472B6',
  cyan: '#00D4FF',
  cyanDark: '#0099CC',
  teal: '#06B6D4',

  // Gradients (arrays for LinearGradient)
  gradientPurplePink: ['#8B5CF6', '#EC4899'] as const,
  gradientCyanBlue: ['#00D4FF', '#0066CC'] as const,
  gradientCard: ['rgba(13,21,38,0)', 'rgba(13,21,38,0.97)'] as const,
  gradientOverlay: ['transparent', '#070C18'] as const,
  gradientButton: ['#00D4FF', '#0055CC'] as const,
  gradientUpgrade: ['#F59E0B', '#EF4444'] as const,
  gradientBorderPurplePink: ['#8B5CF6', '#EC4899'] as const,

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#4B5563',

  // UI Elements
  border: 'rgba(139, 92, 246, 0.25)',
  borderBright: 'rgba(139, 92, 246, 0.6)',
  tabBar: '#0C1428',
  inputBg: '#111827',

  // Status
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',

  // Transparent
  overlay: 'rgba(7, 12, 24, 0.85)',
  cardOverlay: 'rgba(13, 21, 38, 0.7)',
} as const;

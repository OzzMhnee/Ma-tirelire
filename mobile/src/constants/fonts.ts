// Constantes relatives aux polices
export const FONTS = {
  arial: {
    regular: 'System',
    bold: 'System',
    label: 'Arial',
  },
  dyslexic: {
    regular: 'OpenDyslexic-Regular',
    bold: 'OpenDyslexic-Bold',
    label: 'OpenDyslexic',
  },
} as const;

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export type FontFamily = keyof typeof FONTS;

import { PrimaryColor, ColorPalette } from '@od-erp/types';

// Cookie Names
export const THEME_COOKIES = {
    MODE: 'od_erp_theme_mode',
    COLOR: 'od_erp_theme_color',
} as const;

// Default Theme
export const DEFAULT_THEME = {
    MODE: 'light' as const,
    COLOR: 'orange' as const,
};

// Available Primary Colors
export const PRIMARY_COLORS: readonly PrimaryColor[] = [
    'orange',
    'purple',
    'rose',
    'pink',
    'green',
    'amber',
    'blue',
] as const;

// Color Palette Definitions
export const COLOR_PALETTES: Record<PrimaryColor, ColorPalette> = {
    orange: {
        50: '#fff7ed',
        100: '#ffedd5',
        200: '#fed7aa',
        300: '#fdba74',
        400: '#fb923c',
        500: '#e95028',  // Base - User selected
        600: '#ea580c',
        700: '#c2410c',
        800: '#9a3412',
        900: '#7c2d12',
    },
    purple: {
        50: '#faf5ff',
        100: '#f3e8ff',
        200: '#e9d5ff',
        300: '#d8b4fe',
        400: '#c084fc',
        500: '#8b5cf6',  // Base - User selected
        600: '#9333ea',
        700: '#7e22ce',
        800: '#6b21a8',
        900: '#581c87',
    },
    rose: {
        50: '#fff1f2',
        100: '#ffe4e6',
        200: '#fecdd3',
        300: '#fda4af',
        400: '#fb7185',
        500: '#e11d48',  // Base - User selected
        600: '#be123c',
        700: '#9f1239',
        800: '#881337',
        900: '#4c0519',
    },
    pink: {
        50: '#fdf2f8',
        100: '#fce7f3',
        200: '#fbcfe8',
        300: '#f9a8d4',
        400: '#f472b6',
        500: '#db2777',  // Base - User selected
        600: '#be185d',
        700: '#9d174d',
        800: '#831843',
        900: '#500724',
    },
    green: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#16a34a',  // Base - User selected
        600: '#15803d',
        700: '#166534',
        800: '#14532d',
        900: '#052e16',
    },
    amber: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#d97706',  // Base - User selected
        600: '#b45309',
        700: '#92400e',
        800: '#78350f',
        900: '#451a03',
    },
    blue: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#0066ff',  // Base - User selected
        600: '#0052cc',
        700: '#0047b3',
        800: '#003d99',
        900: '#003380',
    },
};

// Semantic Colors (same across all themes)
export const SEMANTIC_COLORS = {
    success: '#16a34a',
    warning: '#f59e0b',
    danger: '#e11d48',
    info: '#6366f1',
} as const;

// Color Display Names (for UI)
export const COLOR_NAMES: Record<PrimaryColor, string> = {
    orange: 'Orange',
    purple: 'Purple',
    rose: 'Rose',
    pink: 'Pink',
    green: 'Green',
    amber: 'Amber',
    blue: 'Blue',
} as const;

// Color Preview (for color picker UI)
export const COLOR_PREVIEW: Record<PrimaryColor, string> = {
    orange: '#e95028',
    purple: '#8b5cf6',
    rose: '#e11d48',
    pink: '#db2777',
    green: '#16a34a',
    amber: '#d97706',
    blue: '#0066ff',
} as const;

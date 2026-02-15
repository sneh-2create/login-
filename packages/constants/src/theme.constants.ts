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
    'blue',
    'green',
    'purple',
    'red',
    'teal',
] as const;

// Color Palette Definitions
export const COLOR_PALETTES: Record<PrimaryColor, ColorPalette> = {
    orange: {
        50: '#fff7ed',
        100: '#ffedd5',
        200: '#fed7aa',
        300: '#fdba74',
        400: '#fb923c',
        500: '#e95029',  // Base
        600: '#ea580c',
        700: '#c2410c',
        800: '#9a3412',
        900: '#7c2d12',
    },
    blue: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#5d78ff',  // Base
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
    },
    green: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#10b981',  // Base
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
    },
    purple: {
        50: '#faf5ff',
        100: '#f3e8ff',
        200: '#e9d5ff',
        300: '#d8b4fe',
        400: '#c084fc',
        500: '#8b5cf6',  // Base
        600: '#9333ea',
        700: '#7e22ce',
        800: '#6b21a8',
        900: '#581c87',
    },
    red: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',  // Base
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
    },
    teal: {
        50: '#f0fdfa',
        100: '#ccfbf1',
        200: '#99f6e4',
        300: '#5eead4',
        400: '#2dd4bf',
        500: '#14b8a6',  // Base
        600: '#0d9488',
        700: '#0f766e',
        800: '#115e59',
        900: '#134e4a',
    },
};

// Semantic Colors (same across all themes)
export const SEMANTIC_COLORS = {
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
} as const;

// Color Display Names (for UI)
export const COLOR_NAMES: Record<PrimaryColor, string> = {
    orange: 'Orange',
    blue: 'Blue',
    green: 'Green',
    purple: 'Purple',
    red: 'Red',
    teal: 'Teal',
} as const;

// Color Preview (for color picker UI)
export const COLOR_PREVIEW: Record<PrimaryColor, string> = {
    orange: '#e95029',
    blue: '#5d78ff',
    green: '#10b981',
    purple: '#8b5cf6',
    red: '#ef4444',
    teal: '#14b8a6',
} as const;

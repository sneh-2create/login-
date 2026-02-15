import Cookies from 'js-cookie';
import { ThemeConfig, ThemeMode, PrimaryColor, CSSVariables } from '@od-erp/types';
import { THEME_COOKIES, DEFAULT_THEME, COLOR_PALETTES, SEMANTIC_COLORS } from '@od-erp/constants';

/**
 * Get theme configuration from cookies
 */
export const getThemeFromCookies = (): ThemeConfig => {
    const mode = Cookies.get(THEME_COOKIES.MODE) as ThemeMode;
    const primaryColor = Cookies.get(THEME_COOKIES.COLOR) as PrimaryColor;

    return {
        mode: mode || DEFAULT_THEME.MODE,
        primaryColor: primaryColor || DEFAULT_THEME.COLOR,
    };
};

/**
 * Save theme configuration to cookies
 */
export const saveThemeToCookies = (config: ThemeConfig): void => {
    Cookies.set(THEME_COOKIES.MODE, config.mode, {
        expires: 365,
        sameSite: 'Lax',
    });
    Cookies.set(THEME_COOKIES.COLOR, config.primaryColor, {
        expires: 365,
        sameSite: 'Lax',
    });
};

/**
 * Generate CSS variables for a theme configuration
 */
export const generateCSSVariables = (config: ThemeConfig): CSSVariables => {
    const { mode, primaryColor } = config;
    const palette = COLOR_PALETTES[primaryColor];
    const isDark = mode === 'dark';

    return {
        // Primary colors
        '--color-primary': palette[500],
        '--color-primary-hover': palette[600],
        '--color-primary-light': palette[100],
        '--color-primary-dark': palette[700],

        // Brand colors (legacy - now theme-aware)
        '--color-brand': palette[500],
        '--color-brand-hover': palette[600],
        '--color-brand-dark': isDark ? palette[800] : palette[900],

        // Background & Foreground
        '--color-background': isDark ? '#0a0a0a' : '#ffffff',
        '--color-foreground': isDark ? '#fafafa' : '#1a1a1a',

        // Muted & Borders
        '--color-muted': isDark ? '#262626' : '#f5f5f5',
        '--color-muted-foreground': isDark ? '#d4d4d8' : '#71717a',
        '--color-border': isDark ? '#404040' : '#e5e5e5',

        // Card
        '--color-card': isDark ? '#171717' : '#ffffff',
        '--color-card-foreground': isDark ? '#fafafa' : '#1a1a1a',

        // Semantic colors
        '--color-success': SEMANTIC_COLORS.success,
        '--color-warning': SEMANTIC_COLORS.warning,
        '--color-danger': SEMANTIC_COLORS.danger,
        '--color-info': SEMANTIC_COLORS.info,
        '--color-secondary': isDark ? '#9ca3af' : '#6c757d',

        // Sidebar specific
        '--sidebar-bg': isDark ? '#171717' : '#ffffff',
        '--sidebar-border': isDark ? '#404040' : '#eff2f5',
        '--sidebar-item-active-bg': isDark ? palette[900] : palette[50],
        '--sidebar-submenu-icon-bg': `color-mix(in srgb, ${palette[500]} 10%, transparent)`,
        '--sidebar-submenu-icon-color': palette[500],
        '--sidebar-section-title': isDark ? '#d4d4d8' : '#3F4254',
        '--sidebar-bullet-inactive': isDark ? '#525252' : '#b8bac3',

        // Header
        '--header-bg': isDark ? '#171717' : '#ffffff',
        '--header-border': isDark ? '#404040' : '#e5e5e5',

        // Layout (legacy - now theme-aware)
        '--aside-bg': isDark ? '#171717' : '#ffffff',
        '--color-grey-1': isDark ? '#262626' : '#f7f8fa',
        '--color-grey-2': isDark ? '#404040' : '#ebedf2',
        '--color-dark': isDark ? '#fafafa' : '#282a3c',
        '--color-light': isDark ? '#0a0a0a' : '#ffffff',
        '--color-white': isDark ? '#0a0a0a' : '#ffffff',

        // Border color (legacy)
        '--border-color': isDark ? '#404040' : '#dee2e6',

        // UI Design System Colors (adapt to dark mode)
        '--ui-gray-50': isDark ? '#262626' : '#f9fafb',
        '--ui-gray-100': isDark ? '#404040' : '#f3f4f6',
        '--ui-gray-200': isDark ? '#525252' : '#e5e7eb',
        '--ui-gray-300': isDark ? '#737373' : '#d1d5db',
        '--ui-gray-400': isDark ? '#a3a3a3' : '#9ca3af',
        '--ui-gray-500': isDark ? '#d4d4d4' : '#6b7280',
        '--ui-gray-600': isDark ? '#e5e5e5' : '#4b5563',
        '--ui-gray-700': isDark ? '#f5f5f5' : '#374151',
        '--ui-gray-800': isDark ? '#fafafa' : '#1f2937',
        '--ui-gray-900': isDark ? '#ffffff' : '#111827',
        '--ui-green': SEMANTIC_COLORS.success,
        '--ui-orange': palette[500],
        '--ui-red': SEMANTIC_COLORS.danger,
        '--ui-orange-light': palette[400],

        // UI Placeholder
        '--ui-placeholder-color': isDark ? '#737373' : '#adaebc',

        // Status Badge Backgrounds (adapt to dark mode)
        '--ui-status-paid-bg': isDark ? '#14532d' : '#d4edd6',
        '--ui-status-pending-bg': isDark ? '#78350f' : '#ffedd5',
        '--ui-status-failed-bg': isDark ? '#881337' : '#f8d7da',
    };
};

/**
 * Apply theme to DOM
 */
export const applyTheme = (config: ThemeConfig): void => {
    const root = document.documentElement;

    // Set data attributes
    root.setAttribute('data-theme', config.mode);
    root.setAttribute('data-primary', config.primaryColor);

    // Generate and apply CSS variables
    const variables = generateCSSVariables(config);
    Object.entries(variables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
    });

    // Save to cookies
    saveThemeToCookies(config);
};

/**
 * Initialize theme on app load
 */
export const initializeTheme = (): ThemeConfig => {
    const config = getThemeFromCookies();
    applyTheme(config);
    return config;
};

/**
 * Map a hex color to the closest theme primary color
 * Used to convert backend colors to theme color names
 */
export const mapHexToThemeColor = (hexColor: string | null | undefined): PrimaryColor => {
    if (!hexColor) return DEFAULT_THEME.COLOR;

    // Normalize hex color
    const hex = hexColor.replace('#', '').toLowerCase();

    // Direct matches for our exact colors
    const colorMap: Record<string, PrimaryColor> = {
        'e95028': 'orange',
        'f97316': 'orange',
        '8b5cf6': 'purple',
        'a855f7': 'purple',
        'e11d48': 'rose',
        'f43f5e': 'rose',
        'db2777': 'pink',
        'ec4899': 'pink',
        '16a34a': 'green',
        '22c55e': 'green',
        'd97706': 'amber',
        'f59e0b': 'amber',
        '0066ff': 'blue',
        '3b82f6': 'blue',
    };

    // Check for direct match
    if (colorMap[hex]) {
        return colorMap[hex];
    }

    // Convert hex to RGB for distance calculation
    const hexToRgb = (h: string): [number, number, number] => {
        const r = parseInt(h.substring(0, 2), 16);
        const g = parseInt(h.substring(2, 4), 16);
        const b = parseInt(h.substring(4, 6), 16);
        return [r, g, b];
    };

    // Calculate color distance
    const colorDistance = (rgb1: [number, number, number], rgb2: [number, number, number]): number => {
        return Math.sqrt(
            Math.pow(rgb1[0] - rgb2[0], 2) +
            Math.pow(rgb1[1] - rgb2[1], 2) +
            Math.pow(rgb1[2] - rgb2[2], 2)
        );
    };

    // Find closest color
    const inputRgb = hexToRgb(hex.padEnd(6, '0').substring(0, 6));
    let closestColor: PrimaryColor = DEFAULT_THEME.COLOR;
    let minDistance = Infinity;

    Object.entries(COLOR_PALETTES).forEach(([colorName, palette]) => {
        const paletteHex = palette[500].replace('#', '');
        const paletteRgb = hexToRgb(paletteHex);
        const distance = colorDistance(inputRgb, paletteRgb);

        if (distance < minDistance) {
            minDistance = distance;
            closestColor = colorName as PrimaryColor;
        }
    });

    return closestColor;
};

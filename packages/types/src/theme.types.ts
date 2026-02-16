// Theme Mode
export type ThemeMode = 'light' | 'dark';

// Primary Color Options
export type PrimaryColor = 'orange' | 'purple' | 'rose' | 'pink' | 'green' | 'amber' | 'blue';

// Theme Configuration
export interface ThemeConfig {
    mode: ThemeMode;
    primaryColor: PrimaryColor;
}

// Color Palette Structure
export interface ColorPalette {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;  // Base color
    600: string;
    700: string;
    800: string;
    900: string;
}

// Complete Color Set for a Theme
export interface ThemeColorSet {
    primary: ColorPalette;
    success: ColorPalette;
    warning: ColorPalette;
    danger: ColorPalette;
    info: ColorPalette;
    gray: ColorPalette;
}

// CSS Variable Map
export interface CSSVariables {
    '--color-primary': string;
    '--color-primary-hover': string;
    '--color-background': string;
    '--color-foreground': string;
    '--color-muted': string;
    '--color-border': string;
    '--color-success': string;
    '--color-warning': string;
    '--color-danger': string;
    '--color-info': string;
    [key: string]: string;
}

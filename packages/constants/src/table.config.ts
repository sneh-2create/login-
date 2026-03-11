/**
 * Font Weight Mapping Constants
 * Maps numeric and string font weights to Tailwind CSS classes
 */

// Numeric font weight to Tailwind class mapping
export const FONT_WEIGHT_NUMERIC_MAP: Record<number, string> = {
    100: 'font-thin',
    200: 'font-extralight',
    300: 'font-light',
    400: 'font-normal',
    500: 'font-medium',
    600: 'font-semibold',
    700: 'font-bold',
    800: 'font-extrabold',
    900: 'font-black',
} as const;

// String font weight to Tailwind class mapping
export const FONT_WEIGHT_STRING_MAP: Record<string, string> = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    black: 'font-black',
} as const;

// Default font weight class
export const DEFAULT_FONT_WEIGHT = 'font-normal';

// Default text color class
export const DEFAULT_TEXT_COLOR = 'text-ui-gray-600';

/**
 * Status Badge Width Constants
 * Maps status badge variants to their fixed widths
 */
export const STATUS_BADGE_WIDTH_MAP: Record<string, string> = {
    paid: 'w-[59px]',
    pending: 'w-[84px]',
    failed: 'w-[71px]',
} as const;

// Default badge width
export const DEFAULT_BADGE_WIDTH = 'w-auto';

/**
 * Status Badge Style Classes
 * Maps status badge variants to their background and text color classes
 */
export const STATUS_BADGE_STYLES: Record<string, string> = {
    paid: 'bg-ui-status-paid-bg text-ui-green',
    pending: 'bg-ui-status-pending-bg text-ui-orange-light',
    failed: 'bg-ui-status-failed-bg text-ui-red',
} as const;

// Default status badge styles
export const DEFAULT_STATUS_BADGE_STYLES = 'bg-ui-gray-100 text-ui-gray-800';

/**
 * Data Table Default Values
 */
export const DEFAULT_ITEMS_PER_PAGE = 10;
export const DEFAULT_ITEMS_PER_PAGE_OPTIONS: number[] = [10, 20, 50];
export const DEFAULT_SEARCH_PLACEHOLDER = 'Search...';

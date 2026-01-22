/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
        "./src/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    DEFAULT: 'var(--color-brand)',
                    dark: 'var(--color-brand-dark)',
                    hover: 'var(--color-brand-hover)',
                    light: 'var(--color-brand-light)'
                },
                primary: {
                    DEFAULT: 'var(--color-primary)',
                    dark: 'var(--color-primary-dark)',
                },
                secondary: 'var(--color-secondary)',
                success: 'var(--color-success)',
                danger: 'var(--color-danger)',
                warning: 'var(--color-warning)',
                info: 'var(--color-info)',
                light: 'var(--color-light)',
                dark: 'var(--color-dark)',
                grey: {
                    1: 'var(--color-grey-1)',
                    2: 'var(--color-grey-2)'
                },
                // UI Design System Colors
                'ui-gray': {
                    50: 'var(--ui-gray-50)',
                    100: 'var(--ui-gray-100)',
                    200: 'var(--ui-gray-200)',
                    300: 'var(--ui-gray-300)',
                    400: 'var(--ui-gray-400)',
                    500: 'var(--ui-gray-500)',
                    600: 'var(--ui-gray-600)',
                    700: 'var(--ui-gray-700)',
                    800: 'var(--ui-gray-800)',
                    900: 'var(--ui-gray-900)',
                },
                'ui-green': 'var(--ui-green)',
                'ui-orange': 'var(--ui-orange)',
                'ui-red': 'var(--ui-red)',
                'ui-orange-light': 'var(--ui-orange-light)',
                'ui-status-paid-bg': 'var(--ui-status-paid-bg)',
                'ui-status-pending-bg': 'var(--ui-status-pending-bg)',
                'ui-status-failed-bg': 'var(--ui-status-failed-bg)',
                'ui-placeholder': 'var(--ui-placeholder-color)',
            },
            letterSpacing: {
                'ui-tight': 'var(--ui-letter-spacing-tight)',
                'ui-tighter': 'var(--ui-letter-spacing-tighter)',
                'ui-wide': 'var(--ui-letter-spacing-wide)',
            },
            fontFamily: {
                sans: ['var(--font-family)', 'sans-serif'],
                body: ['var(--font-family)', 'sans-serif'],
                cabin: ['Cabin', 'sans-serif'],
                poppins: ['Poppins', 'sans-serif'],
            },
            spacing: {
                'header': 'var(--header-height)',
                'aside': 'var(--aside-width)',
                'aside-min': 'var(--aside-minimize-width)'
            }
        },
    },
    plugins: [],
}

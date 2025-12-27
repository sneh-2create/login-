/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
        "./src/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            colors: {
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
            },
            borderRadius: {
                sm: 'var(--border-radius-sm)',
                md: 'var(--border-radius-md)',
                lg: 'var(--border-radius-lg)',
            }
        },
    },
    plugins: [],
}

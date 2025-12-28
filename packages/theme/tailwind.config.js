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
                }
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

/** @type {import('tailwindcss').Config} */
const sharedConfig = require('@od-erp/theme/tailwind.config');

module.exports = {
    ...sharedConfig,
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
        "../../packages/constants/src/**/*.{js,ts,jsx,tsx}"
    ],
    safelist: [
        // Badge filled variants
        { pattern: /bg-\[var\(--badge-(default|success|warning|error|info)-(bg|bg-hover)\)\]/ },
        { pattern: /text-\[var\(--badge-(default|success|warning|error|info)-text\)\]/ },
        { pattern: /border-\[var\(--badge-(default|success|warning|error|info)-(border|border-hover)\)\]/ },
        { pattern: /hover:bg-\[var\(--badge-(default|success|warning|error|info)-bg-hover\)\]/ },
        { pattern: /hover:border-\[var\(--badge-(default|success|warning|error|info)-border-hover\)\]/ },
        // Badge outline variants
        { pattern: /border-\[var\(--badge-outline-(default|success|warning|error|info)-border\)\]/ },
        { pattern: /text-\[var\(--badge-outline-(default|success|warning|error|info)-text\)\]/ },
        { pattern: /hover:bg-\[var\(--badge-outline-(default|success|warning|error|info)-hover-bg\)\]/ },
        // Badge subtle variants
        { pattern: /bg-\[var\(--badge-subtle-(default|success|warning|error|info)-(bg|bg-hover)\)\]/ },
        { pattern: /text-\[var\(--badge-subtle-(default|success|warning|error|info)-text\)\]/ },
        { pattern: /hover:bg-\[var\(--badge-subtle-(default|success|warning|error|info)-bg-hover\)\]/ },
        // Badge layout
        'rounded-[var(--badge-radius)]',
        'px-[var(--badge-px)]',
        'h-[var(--badge-height)]',
        'min-w-[var(--badge-min-width)]',
        'text-[length:var(--badge-font-size)]',
        'font-[var(--badge-font-weight)]',
        'tracking-[var(--badge-letter-spacing)]',
    ],
}

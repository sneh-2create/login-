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
}

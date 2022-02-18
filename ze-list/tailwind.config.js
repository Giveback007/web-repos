/* eslint-disable */
const colors = require('tailwindcss/colors');

module.exports = {
    mode: 'jit',
    content: [
        "./src/**/*.{html,js,ts,jsx,tsx}",
        "./playground/**/*.{html,js,ts,jsx,tsx}"
    ],
    darkMode: 'media',
    theme: {
        extend: {
        
        },
        minWidth: {
            '2': '0.25rem',
            '3': '0.75rem',
            '4': '1rem',
            '6': '1.5rem',
            '12': '3rem',
            '24': '6rem',
            '32': '8rem',
        },
        minHeight: {
            '2': '0.25rem',
            '3': '0.75rem',
            '4': '1rem',
            '6': '1.5rem',
            '12': '3rem',
            '24': '6rem',
            '32': '8rem',
            '64': '16rem',
        },
    },
    plugins: [
        // require('@tailwindcss/forms'),
        // require('@tailwindcss/typography'),
        // require('tailwind-scrollbar'),
    ],
    variants: {
        scrollbar: ['dark']
    }
};
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: '#4F46E5',
                secondary: '#10B981',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'bounce-dot': 'bounce 1.4s infinite ease-in-out both',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                bounce: {
                    '0%, 80%, 100%': { transform: 'scale(0)' },
                    '40%': { transform: 'scale(1)' },
                },
            },
        },
    },
    plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bg-deep': '#05070a',
                'text-muted': '#64748b',
            },
        },
    },
    plugins: [],
}

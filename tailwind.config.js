/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './context/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Courier New', 'monospace'],
            },
            colors: {
                glass: {
                    white: 'rgba(255, 255, 255, 0.08)',
                    border: 'rgba(255, 255, 255, 0.15)',
                    hover: 'rgba(255, 255, 255, 0.14)',
                },
                brand: {
                    50: '#f0f4ff',
                    100: '#e0eaff',
                    200: '#c7d7fe',
                    300: '#a5b8fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                    950: '#1e1b4b',
                },
                accent: {
                    cyan: '#06b6d4',
                    purple: '#a855f7',
                    pink: '#ec4899',
                    orange: '#f97316',
                    green: '#10b981',
                    red: '#ef4444',
                    yellow: '#f59e0b',
                },
                campus: {
                    primary: '#2F5D50',
                    soft: '#4F7F6C',
                    background: '#F7F9F8',
                    text: '#222222',
                    muted: '#6B7280',
                    border: '#E5E7EB',
                    warning: '#F59E0B',
                    success: '#22C55E',
                    white: '#FFFFFF',
                },
                system: {
                    primary: '#1A1A64',   // Primary Blue
                    accent: '#F06414',    // Accent Orange
                    gold: '#D4AF37',      // Gold Accent
                    surface: '#F5F6FA',   // Light Surface
                    text: '#111827',      // Dark Text
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-gradient': 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
                'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            },
            backdropBlur: {
                xs: '2px',
                '2xl': '40px',
                '3xl': '60px',
            },
            boxShadow: {
                glass: '0 8px 32px rgba(0, 0, 0, 0.37)',
                'glass-sm': '0 4px 16px rgba(0, 0, 0, 0.25)',
                'glass-lg': '0 16px 64px rgba(0, 0, 0, 0.5)',
                'glow-purple': '0 0 30px rgba(99, 102, 241, 0.4)',
                'glow-cyan': '0 0 30px rgba(6, 182, 212, 0.4)',
                'glow-pink': '0 0 30px rgba(236, 72, 153, 0.4)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'float-delay': 'float 6s ease-in-out 2s infinite',
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'slide-up': 'slideUp 0.5s ease-out',
                'fade-in': 'fadeIn 0.4s ease-out',
                'spin-slow': 'spin 8s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                pulseGlow: {
                    '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' },
                    '50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(99, 102, 241, 0.8)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}

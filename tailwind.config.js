/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta institucional da Prefeitura de São Luís
        primary: {
          DEFAULT: '#0066CC', // Azul institucional (primária)
          50: '#E6F2FF',
          100: '#CCE5FF',
          200: '#99CBFF',
          300: '#66B1FF',
          400: '#3397FF',
          500: '#0066CC',
          600: '#0052A3',
          700: '#003D7A',
          800: '#002952',
          900: '#001429',
        },
        secondary: {
          DEFAULT: '#00A859', // Verde institucional (secundária)
          50: '#E6F9F0',
          100: '#CCF3E1',
          200: '#99E7C3',
          300: '#66DBA5',
          400: '#33CF87',
          500: '#00A859',
          600: '#008647',
          700: '#006535',
          800: '#004324',
          900: '#002212',
        },
        accent: {
          DEFAULT: '#FFB800', // Amarelo/dourado (destaque)
          50: '#FFF9E6',
          100: '#FFF3CC',
          200: '#FFE799',
          300: '#FFDB66',
          400: '#FFCF33',
          500: '#FFB800',
          600: '#CC9300',
          700: '#996E00',
          800: '#664900',
          900: '#332500',
        },
        // Cores semânticas
        success: {
          DEFAULT: '#00A859',
          light: '#E6F9F0',
          dark: '#006535',
        },
        warning: {
          DEFAULT: '#FFB800',
          light: '#FFF9E6',
          dark: '#996E00',
        },
        error: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2',
          dark: '#991B1B',
        },
        // Neutros institucionais
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'institutional': '0.5rem', // 8px - bordas suaves e modernas
        'card': '1rem', // 16px - cards bem definidos
      },
      boxShadow: {
        'institutional': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Material Design 3 color tokens (flat keys — match HTML design system)
        'primary': '#795900',
        'on-primary': '#ffffff',
        'primary-container': '#d4a017',
        'on-primary-container': '#503a00',
        'primary-fixed': '#ffdfa0',
        'primary-fixed-dim': '#f6be39',
        'on-primary-fixed': '#261a00',
        'on-primary-fixed-variant': '#5c4300',
        'inverse-primary': '#f6be39',

        'secondary': '#565e71',
        'on-secondary': '#ffffff',
        'secondary-container': '#dbe2f9',
        'on-secondary-container': '#5c6477',
        'secondary-fixed': '#dbe2f9',
        'secondary-fixed-dim': '#bfc6dc',
        'on-secondary-fixed': '#141b2c',
        'on-secondary-fixed-variant': '#3f4759',

        'tertiary': '#5f5e5e',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#aaa8a8',
        'on-tertiary-container': '#3e3d3d',
        'tertiary-fixed': '#e5e2e1',
        'tertiary-fixed-dim': '#c8c6c5',
        'on-tertiary-fixed': '#1c1b1b',
        'on-tertiary-fixed-variant': '#474746',

        'error': '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',

        'surface': '#f7fafd',
        'surface-dim': '#d7dadd',
        'surface-bright': '#f7fafd',
        'surface-variant': '#e0e3e6',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f1f4f7',
        'surface-container': '#ebeef1',
        'surface-container-high': '#e5e8eb',
        'surface-container-highest': '#e0e3e6',
        'surface-tint': '#795900',

        'on-surface': '#181c1e',
        'on-surface-variant': '#4f4634',
        'on-background': '#181c1e',
        'background': '#f7fafd',

        'outline': '#817662',
        'outline-variant': '#d3c5ae',

        'inverse-surface': '#2d3133',
        'inverse-on-surface': '#eef1f4',
      },
      fontFamily: {
        headline: ['IBM Plex Sans Thai', 'Manrope', 'sans-serif'],
        body: ['IBM Plex Sans Thai', 'Manrope', 'sans-serif'],
        label: ['Prompt', 'Be Vietnam Pro', 'sans-serif'],
        prompt: ['Prompt', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        sm: '0.125rem',
        md: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '0.75rem',
      },
    },
  },
  plugins: [],
}

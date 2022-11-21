// themes.js — CSS custom property theming system.
// Consumers can override any variable without touching the source.
// React pattern: ThemeProvider + CSS-in-JS (emotion, styled-components).
// Alpine pattern: inject CSS vars into the widget's root element. Zero deps.

export const THEMES = {
    light: {
        '--snap-primary':    '#4f46e5',
        '--snap-primary-h':  '#4338ca',
        '--snap-bg':         '#ffffff',
        '--snap-text':       '#1f2937',
        '--snap-text-muted': '#6b7280',
        '--snap-border':     '#e5e7eb',
        '--snap-input-bg':   '#f9fafb',
        '--snap-radius':     '12px',
        '--snap-shadow':     '0 20px 60px rgba(0,0,0,.15)',
    },
    dark: {
        '--snap-primary':    '#818cf8',
        '--snap-primary-h':  '#6366f1',
        '--snap-bg':         '#1e1e2e',
        '--snap-text':       '#cdd6f4',
        '--snap-text-muted': '#9399b2',
        '--snap-border':     '#313244',
        '--snap-input-bg':   '#181825',
        '--snap-radius':     '12px',
        '--snap-shadow':     '0 20px 60px rgba(0,0,0,.5)',
    },
    minimal: {
        '--snap-primary':    '#000000',
        '--snap-primary-h':  '#333333',
        '--snap-bg':         '#ffffff',
        '--snap-text':       '#000000',
        '--snap-text-muted': '#666666',
        '--snap-border':     '#cccccc',
        '--snap-input-bg':   '#f5f5f5',
        '--snap-radius':     '4px',
        '--snap-shadow':     '0 4px 16px rgba(0,0,0,.12)',
    },
};

export function applyTheme(el, theme = 'light', overrides = {}) {
    const vars = { ...(THEMES[theme] ?? THEMES.light), ...overrides };
    Object.entries(vars).forEach(([key, val]) => {
        el.style.setProperty(key, val);
    });
}

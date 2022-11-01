// snap-feedback — Alpine.js standalone widget
// Key insight: Alpine can live WITHOUT Laravel. It's just a JS library.
// React equivalent: a tiny React micro-frontend embedded via <script> tag.
// Alpine is lighter: no virtual DOM, no JSX, no bundler required for consumers.
//
// This whole widget is Alpine.data + a <script> tag embed.
// No Next.js. No Vite config for the consumer. Just one JS file.

import Alpine from 'alpinejs';

export function feedback({
    apiUrl    = '/api/feedback',
    apiKey    = '',
    position  = 'bottom-right',
    theme     = 'light',
    buttonText = 'Feedback',
} = {}) {
    return {
        // State
        isOpen:    false,
        submitted: false,
        loading:   false,
        mood:      null,       // 'happy' | 'neutral' | 'sad'
        message:   '',
        email:     '',

        // Config
        apiUrl,
        apiKey,
        position,
        theme,
        buttonText,

        init() {
            // Inject scoped styles — no CSS file to load
            const style = document.createElement('style');
            style.textContent = this._styles();
            document.head.appendChild(style);
        },

        open()  { this.isOpen = true;  this.$nextTick(() => this.$refs.messageInput?.focus()); },
        close() { this.isOpen = false; },

        selectMood(m) { this.mood = m; },

        async submit() {
            if (!this.message.trim()) return;

            this.loading = true;

            try {
                await fetch(this.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': this.apiKey,
                    },
                    body: JSON.stringify({
                        mood:    this.mood,
                        message: this.message,
                        email:   this.email || null,
                        url:     window.location.href,
                        ua:      navigator.userAgent,
                    }),
                });

                this.submitted = true;
                setTimeout(() => {
                    this.submitted = false;
                    this.isOpen    = false;
                    this.mood      = null;
                    this.message   = '';
                    this.email     = '';
                }, 2500);
            } catch (e) {
                console.error('[snap-feedback] submit failed:', e);
            } finally {
                this.loading = false;
            }
        },

        _styles() {
            return `
                [data-snap-widget] * { box-sizing: border-box; font-family: system-ui, sans-serif; }
                [data-snap-widget] .snap-btn {
                    position: fixed; z-index: 9999; padding: 10px 16px; border-radius: 20px;
                    background: #4f46e5; color: #fff; font-size: 14px; font-weight: 500;
                    border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,.2);
                }
                [data-snap-widget].bottom-right .snap-btn { bottom: 24px; right: 24px; }
                [data-snap-widget].bottom-left  .snap-btn { bottom: 24px; left: 24px; }
            `;
        },
    };
}

// Auto-register if Alpine is available globally
if (typeof window !== 'undefined') {
    window.SnapFeedback = { feedback };

    // Auto-init from data attributes
    document.addEventListener('DOMContentLoaded', () => {
        const script = document.querySelector('script[data-api-key]');
        if (script) {
            window.SnapFeedback._autoInit({
                apiKey:    script.getAttribute('data-api-key'),
                position:  script.getAttribute('data-position')   || 'bottom-right',
                theme:     script.getAttribute('data-theme')      || 'light',
            });
        }
    });

    window.SnapFeedback._autoInit = (config) => {
        const el = document.createElement('div');
        el.setAttribute('data-snap-widget', '');
        el.setAttribute('x-data', `feedback(${JSON.stringify(config)})`);
        el.setAttribute('x-init', 'init()');
        el.innerHTML = `
            <button class="snap-btn" @click="open()" x-text="buttonText"></button>
        `;
        document.body.appendChild(el);
        Alpine.data('feedback', () => feedback(config));
        Alpine.start();
    };
}

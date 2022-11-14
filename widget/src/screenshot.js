// screenshot.js — html2canvas integration for in-widget screenshot capture.
// The killer feature: capture the entire page FROM INSIDE the widget.
// User can annotate before sending. No browser extension needed.
//
// html2canvas renders the DOM to a canvas element.
// We then let the user draw annotations on top before submission.

export async function captureScreenshot(options = {}) {
    const { html2canvas } = await import('html2canvas');

    const canvas = await html2canvas(document.body, {
        logging:        false,
        allowTaint:     true,
        useCORS:        true,
        scale:          options.scale     ?? window.devicePixelRatio ?? 1,
        width:          options.width     ?? window.innerWidth,
        height:         options.height    ?? window.innerHeight,
        scrollY:        -window.scrollY,
        scrollX:        -window.scrollX,
        // Exclude the widget overlay from the screenshot
        ignoreElements: (el) => el.hasAttribute('data-snap-widget'),
    });

    return canvas.toDataURL('image/png', 0.8);
}

// Alpine component mixin for screenshot state
export function withScreenshot() {
    return {
        screenshot:        null,
        screenshotLoading: false,
        screenshotError:   null,

        async capture() {
            this.screenshotLoading = true;
            this.screenshotError   = null;

            try {
                this.screenshot = await captureScreenshot();
            } catch (e) {
                this.screenshotError = 'Screenshot failed. Proceeding without it.';
                console.warn('[snap-feedback] screenshot failed:', e);
            } finally {
                this.screenshotLoading = false;
            }
        },

        clearScreenshot() {
            this.screenshot = null;
        },
    };
}

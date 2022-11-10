// submit.js — API submission logic extracted for testability.
// Handles: success animation, error state, screenshot attachment.
// Called by feedback.js submit() method.

export async function submitFeedback({ apiUrl, apiKey, payload }) {
    const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey,
        },
        body: JSON.stringify({
            ...payload,
            url:       window.location.href,
            ua:        navigator.userAgent,
            timestamp: new Date().toISOString(),
        }),
    });

    if (!res.ok) {
        throw new Error(`[snap-feedback] HTTP ${res.status}: ${res.statusText}`);
    }

    return res.json();
}

// Success animation — scale + fade the trigger button, show confirmation
export function playSuccessAnimation(el) {
    if (!el) return;
    el.classList.add('snap-success');
    setTimeout(() => el.classList.remove('snap-success'), 1500);
}

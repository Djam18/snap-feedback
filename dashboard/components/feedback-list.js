// feedback-list.js — Alpine.js admin dashboard component.
// No framework needed. Alpine.store + fetch. That's it.
//
// React: useEffect + fetch + useState. Same pattern, Alpine is less ceremony.

export function feedbackList({ adminKey, apiUrl = '/feedback' } = {}) {
    return {
        items:    [],
        loading:  false,
        error:    null,
        filter:   { mood: 'all', priority: 'all' },
        page:     1,
        hasMore:  true,

        async init() {
            await this.load();
        },

        async load(reset = false) {
            if (reset) { this.page = 1; this.items = []; this.hasMore = true; }
            if (!this.hasMore || this.loading) return;

            this.loading = true;
            this.error   = null;

            try {
                const params = new URLSearchParams({
                    page:  this.page,
                    limit: 25,
                    ...(this.filter.mood     !== 'all' ? { mood:     this.filter.mood }     : {}),
                    ...(this.filter.priority !== 'all' ? { priority: this.filter.priority } : {}),
                });

                const res = await fetch(`${apiUrl}?${params}`, {
                    headers: { 'X-Admin-Key': adminKey },
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const data  = await res.json();
                this.items  = [...this.items, ...data];
                this.hasMore = data.length === 25;
                this.page++;
            } catch (e) {
                this.error = e.message;
            } finally {
                this.loading = false;
            }
        },

        filterBy(key, value) {
            this.filter[key] = value;
            this.load(true);
        },

        moodEmoji(mood) {
            return { happy: '😀', neutral: '😐', sad: '😞' }[mood] ?? '❓';
        },

        priorityBadge(priority) {
            return {
                high:   'bg-red-100 text-red-700',
                normal: 'bg-gray-100 text-gray-600',
                low:    'bg-blue-100 text-blue-600',
            }[priority] ?? 'bg-gray-100 text-gray-600';
        },
    };
}

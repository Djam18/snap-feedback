// tag-manager.js — tagging and priority classification for feedback items.
// Inline editing, keyboard shortcuts, multi-select tag combo.

export function tagManager({ adminKey, apiUrl = '/feedback' } = {}) {
    return {
        PRIORITY_LEVELS: ['low', 'normal', 'high'],
        COMMON_TAGS:     ['bug', 'ux', 'feature', 'praise', 'question', 'confusing'],

        editingId:  null,
        pendingTags: [],
        pendingPriority: 'normal',

        startEdit(item) {
            this.editingId       = item.id;
            this.pendingTags     = [...(item.tags ?? [])];
            this.pendingPriority = item.priority ?? 'normal';
        },

        cancelEdit() {
            this.editingId = null;
        },

        toggleTag(tag) {
            if (this.pendingTags.includes(tag)) {
                this.pendingTags = this.pendingTags.filter(t => t !== tag);
            } else {
                this.pendingTags = [...this.pendingTags, tag];
            }
        },

        async saveEdit(item) {
            const updated = {
                ...item,
                tags:     this.pendingTags,
                priority: this.pendingPriority,
            };

            await fetch(`${apiUrl}/${item.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Key':  adminKey,
                },
                body: JSON.stringify({ tags: updated.tags, priority: updated.priority }),
            });

            Object.assign(item, updated);
            this.editingId = null;
        },

        tagColor(tag) {
            const colors = {
                bug:       'bg-red-100 text-red-700',
                ux:        'bg-purple-100 text-purple-700',
                feature:   'bg-blue-100 text-blue-700',
                praise:    'bg-green-100 text-green-700',
                question:  'bg-yellow-100 text-yellow-700',
                confusing: 'bg-orange-100 text-orange-700',
            };
            return colors[tag] ?? 'bg-gray-100 text-gray-600';
        },
    };
}

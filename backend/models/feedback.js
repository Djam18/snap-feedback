// feedback.js — SQLite storage via better-sqlite3.
// Simple enough: one table, JSON tags column.
// In production: swap this module for a PostgreSQL adapter.

const Database = require('better-sqlite3');
const path     = require('path');

const dbPath = process.env.DB_PATH ?? path.join(__dirname, '../../data/feedback.db');
const db     = new Database(dbPath);

// Create table on first run
db.exec(`
    CREATE TABLE IF NOT EXISTS feedback (
        id          TEXT PRIMARY KEY,
        mood        TEXT,
        message     TEXT NOT NULL,
        email       TEXT,
        url         TEXT,
        screenshot  TEXT,
        ua          TEXT,
        timestamp   TEXT NOT NULL,
        tags        TEXT DEFAULT '[]',
        priority    TEXT DEFAULT 'normal',
        read        INTEGER DEFAULT 0,
        created_at  TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_feedback_timestamp ON feedback(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_feedback_mood      ON feedback(mood);
`);

const stmtCreate   = db.prepare(`INSERT INTO feedback VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const stmtFindAll  = db.prepare(`SELECT * FROM feedback ORDER BY timestamp DESC LIMIT ? OFFSET ?`);
const stmtUpdateTags = db.prepare(`UPDATE feedback SET tags = ?, priority = ? WHERE id = ?`);

module.exports = {
    create(item) {
        stmtCreate.run(
            item.id, item.mood, item.message, item.email, item.url,
            item.screenshot, item.ua, item.timestamp,
            JSON.stringify(item.tags), item.priority, item.read ? 1 : 0
        );
        return item;
    },

    findAll({ mood, priority, page = 1, limit = 50 } = {}) {
        const offset = (page - 1) * limit;
        let rows     = stmtFindAll.all(limit, offset);

        if (mood)     rows = rows.filter(r => r.mood     === mood);
        if (priority) rows = rows.filter(r => r.priority === priority);

        return rows.map(r => ({ ...r, tags: JSON.parse(r.tags), read: !!r.read }));
    },

    updateMeta(id, { tags, priority }) {
        stmtUpdateTags.run(JSON.stringify(tags), priority, id);
    },
};

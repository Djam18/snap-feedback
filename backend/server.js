// Express.js backend for snap-feedback widget.
// Stores feedback in SQLite (development) or PostgreSQL (production).
// Simple REST API: POST /feedback, GET /feedback (authenticated).
//
// Why Express and not Laravel/FastAPI?
// The widget is meant to work on any site. The backend should be deployable anywhere.
// Express + SQLite is the simplest possible persistent storage.

const express = require('express');
const cors    = require('cors');
const { v4: uuid } = require('uuid');
const db      = require('./models/feedback');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? '*',
}));
app.use(express.json({ limit: '10mb' })); // screenshots can be large

// API key middleware — applied to all routes except healthcheck
function requireApiKey(req, res, next) {
    const key = req.headers['x-api-key'];
    if (!key || key !== process.env.WIDGET_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

// POST /feedback — submit from widget (public: validated by API key)
app.post('/feedback', requireApiKey, async (req, res) => {
    const { mood, message, email, url, screenshot, ua, timestamp } = req.body;

    if (!message?.trim()) {
        return res.status(400).json({ error: 'message is required' });
    }

    const item = await db.create({
        id:         uuid(),
        mood:       mood ?? null,
        message:    message.trim().slice(0, 2000),
        email:      email ?? null,
        url:        url ?? null,
        screenshot: screenshot ?? null,
        ua:         ua ?? null,
        timestamp:  timestamp ?? new Date().toISOString(),
        tags:       [],
        priority:   'normal',
        read:       false,
    });

    res.status(201).json({ id: item.id });
});

// GET /feedback — admin only (separate admin key)
app.get('/feedback', (req, res, next) => {
    if (req.headers['x-admin-key'] !== process.env.ADMIN_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}, async (req, res) => {
    const { mood, priority, page = 1, limit = 50 } = req.query;

    const items = await db.findAll({ mood, priority, page: +page, limit: +limit });
    res.json(items);
});

// GET /health
app.get('/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }));

app.listen(PORT, () => {
    console.log(`snap-feedback backend running on :${PORT}`);
});

module.exports = app;

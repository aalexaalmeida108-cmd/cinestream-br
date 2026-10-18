// language: JavaScript, file: server.js, target: Node.js / Express
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/catalog', (req, res) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'data', 'catalog.json'), 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ error: 'Failed to load catalog' });
    }
});

app.get('/api/title/:id', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'catalog.json'), 'utf8'));
        const item = data.find(i => i.id === req.params.id);
        if (item) {
            res.json(item);
        } else {
            res.status(404).json({ error: 'Title not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Streaming platform server running on port ${PORT}`);
});

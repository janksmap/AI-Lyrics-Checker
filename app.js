const express = require('express');
const gemini = require('./gemini.js');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// CORS middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'chrome-extension://phlgeijgelnfglkjpplhlmjniadehokp');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
  });

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

app.get('/', (req, res) => {
    res.send(`Server running at http://localhost:${port}/`);
});

app.post('/check-lyrics', async (req, res) => {
    const { songTitle, artist } = req.body;

    if (!songTitle || !artist) {
        return res.status(400).json({ error: 'Song title and artist are required' });
    }

    const responseObject = await gemini.checkSong(songTitle, artist);
    console.log(responseObject);

    res.json(responseObject);
});


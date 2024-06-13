const express = require('express');
const gemini = require('./gemini.js');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
// app.use(cors());

const corsOptions = {
    origin: 'chrome-extension://phlgeijgelnfglkjpplhlmjniadehokp',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));

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


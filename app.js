const express = require('express');
const gemini = require('./gemini.js');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
// app.use(cors());

// Your Chrome extension ID
const chromeExtensionId = 'phlgeijgelnfglkjpplhlmjniadehokp';

// Configure CORS to allow requests from your Chrome extension
const corsOptions = {
    origin: [
        `chrome-extension://${chromeExtensionId}`,
        'https://open.spotify.com'
    ],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
};

// Middleware to log requests for debugging
app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.url}`);
    console.log(`Origin: ${req.get('Origin')}`);
    next();
});

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


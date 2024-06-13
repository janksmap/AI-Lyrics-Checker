const { getLyrics, getSong } = require("genius-lyrics-api");
const { GoogleGenerativeAI, GoogleGenerativeAIResponseError, GoogleGenerativeAIFetchError } = require("@google/generative-ai");
const { checkDatabase, addItem } = require("./database");
require('dotenv').config();

const GENIUS_API_KEY = process.env.GENIUS_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Genius Lyrics API => https://github.com/farshed/genius-lyrics-api?tab=readme-ov-file#types
const lyrics = async (parameters) => {
    const song = await getSong(parameters);
    if (song == null) return 'Clean';

    const returnedTitle = song.title.split(/\s+by\s+/i)[0].trim(); // The RegEx detects any kind of space

    if (normalizeTitle(parameters.title) == normalizeTitle(returnedTitle)) {
        console.log('Lyrics found.');
        return song.lyrics;
    }
    else {
        return 'Clean';
    }
};

function normalizeTitle(title) {
    return title.toLowerCase()
        .replace(/[-()]/g, '') // Remove hyphens and parentheses
        .replace(/\s+/g, ' ')  // Replace multiple spaces with a single space
        .trim();               // Remove leading and trailing spaces
}

const checkSongSuitability = async (lyrics) => {
    const prompt = `Does the following text meet any of the following criteria: presence of swear words or foul language (including minor language), references to drugs, alcohol, sex or innuendo, and use of the Lord's name in vain? Respond with 'Clean' if the text does not match these criteria or 'Explicit' if the text does match these criteria. If unsure, respond with 'Explicit'. ${lyrics}`;
    console.log('Querying Gemini');

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
    
        return text;
    }
    catch (error) {
        if (error instanceof GoogleGenerativeAIResponseError) {
            console.log('Explicit');
            return 'Explicit'
        }
        else if (error instanceof GoogleGenerativeAIFetchError) {
            console.log('Too many requests');
            return 'Too many requests';
        }
        else {
            console.log(error);
        }
    }
}

async function checkSong(songTitle, artist) {
    let result = await checkDatabase(songTitle, artist); // See if the song is already stored

    if (result != null) {
        console.log('Song exists in database.');
        return result;
    }
    else {
        console.log('Song does not exist in database.');
        const parameters =  {
            apiKey: GENIUS_API_KEY,
            title: songTitle,
            artist: artist,
            optimizeQuery: true
        };
    
        let returnedLyrics = await lyrics(parameters);

        if (returnedLyrics == 'Clean') {
            addItem(songTitle, artist, 'Clean'); // Add to the database
            return 'Clean';
        }
        let songSuitability = await checkSongSuitability(returnedLyrics);
        if (songSuitability = 'Too many requests') return songSuitability;
        if (songSuitability == 'Pleaseprovidethetextyouwouldlikemetoanalyze.Ineedthetexttodetermineifitmeetsanyofthecriteriayoulisted.') {
            songSuitability = 'Clean';
        }
        if (songSuitability == 'Too many requests') return 'Too many requests';
        let songSuitabilityCleanedResponse = songSuitability.replace(/\s/g, ''); // Remove newline characters
        if (songSuitabilityCleanedResponse == 'Pleaseprovidethetextyouwouldlikemetoanalyze.Ineedthetexttodetermineifitmeetsanyofthecriteriayoulisted.') {
            songSuitabilityCleanedResponse = 'Clean';
        }
        addItem(songTitle, artist, songSuitabilityCleanedResponse); // Add to the database
        return songSuitabilityCleanedResponse;
    }
}

module.exports = {
    checkSong
}

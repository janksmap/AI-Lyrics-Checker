
const sqlite3 = require('sqlite3').verbose();

async function checkDatabase(songTitle, artist) {
    const db = new sqlite3.Database('./songs_on_file.db');

    return await new Promise((resolve, reject) => {
        const query = `
            SELECT *
            FROM Songs_On_File
            WHERE songTitle = ? AND artist = ?;
        `;
        
        db.get(query, [songTitle, artist], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row); // Resolve with the row (or null if no match)
            }
        });

        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            }
        });
    });
}

async function addItem(songTitle, artist, verdict) {
    const db = new sqlite3.Database('./songs_on_file.db');
    
    if (await checkDatabase(songTitle, artist) != null) {
        console.log('Song already in database.')
        return;
    }

    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO Songs_On_File (songTitle, artist, verdict) VALUES (?, ?, ?);`;

        db.run(sql, [songTitle, artist, verdict], function(err) {
            if (err) {
                console.error('Error inserting item:', err.message);
                return;
            }
        });

        console.log(`A new item has been inserted.`);

        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            }
        });
    });
}

module.exports = {
    checkDatabase,
    addItem
}
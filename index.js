const express = require('express');
const app = express();
const fs = require('fs');
const cors = require('cors');

let repertorio = require('./repertorio.json');

app.use(express.json());
app.use(cors());

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

// Point 1: Return a web page as a response to a GET request
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Point 2: Provide different routes with different HTTP methods (CRUD operations)
app.get('/canciones', (req, res) => {
    res.json(repertorio);
});

// Point 3: Manipulate the payload of an HTTP request to the server
app.post('/canciones', (req, res) => {
    const { titulo, artista, tono } = req.body;

    // Validate that the body is not empty or incomplete
    if (!titulo || !artista || !tono) {
        return res.status(400).json({ error: 'Invalid request body.' });
    }

    // Validate that the ID is not repeated
    const existingSong = repertorio.find(song => song.titulo === titulo && song.artista === artista && song.tono === tono);
    if (existingSong) {
        return res.status(400).json({ error: 'The song already exists in the repertoire.' });
    }

    const newSong = {
        id: getMaxId() + 1,
        titulo,
        artista,
        tono
    };

    // Ensure that repertorio is an array before adding the new song
    if (!Array.isArray(repertorio)) {
        repertorio = [];
    }

    repertorio.push(newSong);
    fs.writeFileSync('./repertorio.json', JSON.stringify(repertorio, null, 2)); // Using null and 2 for pretty formatting
    res.status(201).json(newSong);
    console.log('New song added');
});

// Point 4: Manipulate parameters obtained in the URL
app.put('/canciones/:id', (req, res) => {
    const { id } = req.params;
    const { titulo, artista, tono } = req.body;

    if (!titulo || !artista || !tono) {
        return res.status(400).json({ error: 'Invalid request body.' });
    }

    const index = repertorio.findIndex(song => song.id.toString() === id);

    if (index !== -1) {
        repertorio[index].titulo = titulo;
        repertorio[index].artista = artista;
        repertorio[index].tono = tono;

        fs.writeFileSync('./repertorio.json', JSON.stringify(repertorio, null, 2));

        res.status(200).json(repertorio[index]);
        console.log(`Song "${id}" has been updated`);
    } else {
        res.status(404).json({ error: 'Song not found' });
        console.log(error, 'Song not found');
    }
});

// Point 5: Manipulate the payload of an HTTP request to the server
app.delete('/canciones/:id', (req, res) => {
    const { id } = req.params;
    const songs = repertorio;
    const index = songs.findIndex(song => song.id.toString() === id);

    if (index !== -1) {
        songs.splice(index, 1);
        fs.writeFileSync('./repertorio.json', JSON.stringify(songs, null, 2));
        res.status(200).send(`Song "${id}" has been deleted`);
        console.log(`Song "${id}" has been deleted`);
    } else {
        res.status(404).send(`No song found with ID "${id}"`);
        console.log(`No song found with ID "${id}"`);
    }
});

// Function to get the maximum ID from the repertorio
const getMaxId = () => {
    let maxId = 0;
    for (const song of repertorio) {
        if (song.id > maxId) {
            maxId = song.id;
        }
    }
    return maxId;
};

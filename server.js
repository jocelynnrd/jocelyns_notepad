// Set the port to an environment variable or default to 3001
const PORT = process.env.PORT || 3001;

// Import required modules (only works on Node.js)
const fs = require('fs');
const path = require('path');
const express = require('express');

// Create an Express application
const app = express();

// Load initial data from db.json file
const allNotes = require('./db/db.json');

// Middleware to parse URL-encoded and JSON request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Endpoint to get all notes as JSON, excluding the first element (used as a counter)
app.get('/api/notes', (req, res) => {
    res.json(allNotes.slice(1));
});

// Endpoint to serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

// Endpoint to serve the notes page
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'));
});

// Wildcard route to catch all other routes and redirect to the main page
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

// Function to create a new note and save it to db.json
function createNewNote(body, notesArray) {
    // Create a new note with data from the request body
    const newNote = body;

    // Initialize the notes array if it's not already an array
    if (!Array.isArray(notesArray)) notesArray = [];

    // Set up the first element as an ID counter if not already done
    if (notesArray.length === 0) notesArray.push(0);

    // Assign an ID to the new note and increment the counter
    body.id = notesArray[0];
    notesArray[0]++;

    // Add the new note to the array and save it to the db.json file
    notesArray.push(newNote);
    fs.writeFileSync(path.join(__dirname, './db/db.json'), JSON.stringify(notesArray, null, 2));

    return newNote;
}

// POST endpoint to add a new note
app.post('/api/notes', (req, res) => {
    const newNote = createNewNote(req.body, allNotes);
    res.json(newNote); // Respond with the newly created note
});

// Function to delete a note by ID
function deleteNote(id, notesArray) {
    // Loop through the array to find the note with the given ID
    for (let i = 0; i < notesArray.length; i++) {
        let note = notesArray[i];

        // If found, remove the note and update the db.json file
        if (note.id == id) {
            notesArray.splice(i, 1);
            fs.writeFileSync(path.join(__dirname, './db/db.json'), JSON.stringify(notesArray, null, 2));
            break;
        }
    }
}

// DELETE endpoint to remove a note by ID
app.delete('/api/notes/:id', (req, res) => {
    deleteNote(req.params.id, allNotes);
    res.json(true); // Respond to confirm deletion
});

// Start the server
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});
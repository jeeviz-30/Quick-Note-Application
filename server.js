const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'notes.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper functions to read and write notes
const readNotes = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, '[]');
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (error) {
        console.error('Error reading notes:', error);
        return [];
    }
};

const writeNotes = (notes) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2));
    } catch (error) {
        console.error('Error writing notes:', error);
    }
};

// --- REST API Endpoints ---

// GET /notes - Retrieve all notes
app.get('/notes', (req, res) => {
    const notes = readNotes();
    res.json(notes);
});

// POST /notes - Add a new note
app.post('/notes', (req, res) => {
    const { title, content } = req.body;
    
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    const notes = readNotes();
    const newNote = {
        id: Date.now().toString(),
        title,
        content,
        createdAt: new Date().toLocaleString()
    };

    notes.push(newNote);
    writeNotes(notes);
    res.status(201).json(newNote);
});

// DELETE /notes/:id - Delete a note by ID
app.delete('/notes/:id', (req, res) => {
    const { id } = req.params;
    let notes = readNotes();
    
    const filteredNotes = notes.filter(note => note.id !== id);

    if (notes.length === filteredNotes.length) {
        return res.status(404).json({ error: 'Note not found' });
    }

    writeNotes(filteredNotes);
    res.json({ message: 'Note deleted successfully' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
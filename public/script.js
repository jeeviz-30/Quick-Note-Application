const API_URL = '/notes';

const noteForm = document.getElementById('note-form');
const noteTitleInput = document.getElementById('note-title');
const noteContentInput = document.getElementById('note-content');
const notesList = document.getElementById('notes-list');

// Fetch and render notes on initial load
document.addEventListener('DOMContentLoaded', fetchNotes);

// 1. Fetch all notes from Backend
async function fetchNotes() {
    try {
        const response = await fetch(API_URL);
        const notes = await response.json();
        renderNotes(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
    }
}

// 2. Render notes on the DOM
function renderNotes(notes) {
    notesList.innerHTML = '';

    if (notes.length === 0) {
        notesList.innerHTML = '<p class="empty-msg">No notes found. Create one above!</p>';
        return;
    }

    notes.forEach(note => {
        const noteCard = document.createElement('div');
        noteCard.classList.add('note-card');
        
        noteCard.innerHTML = `
            <div>
                <h3>${escapeHTML(note.title)}</h3>
                <p>${escapeHTML(note.content)}</p>
            </div>
            <div class="note-footer">
                <span>${note.createdAt}</span>
                <button class="delete-btn" onclick="deleteNote('${note.id}')">Delete</button>
            </div>
        `;
        notesList.appendChild(noteCard);
    });
}

// 3. Add a new note
noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();

    if (!title || !content) return;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, content })
        });

        if (response.ok) {
            noteTitleInput.value = '';
            noteContentInput.value = '';
            fetchNotes(); // Refresh list
        }
    } catch (error) {
        console.error('Error adding note:', error);
    }
});

// 4. Delete a note
async function deleteNote(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            fetchNotes(); // Refresh list
        }
    } catch (error) {
        console.error('Error deleting note:', error);
    }
}

// Utility function to prevent XSS attacks
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
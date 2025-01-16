import { messages } from '../lang/messages/en/user.js';

// Common constants
const lastSavedEl = document.getElementById('last-saved');
const lastRetrievedEl = document.getElementById('last-retrieved');
const notesContainer = document.getElementById('notes-container');
const addNoteButton = document.getElementById('add-note');
const FETCH_DATA_INTERVAL = 2000;

// Function to update localized content for each page
const applyLocalization = (localizationMap) => {
    Object.entries(localizationMap).forEach(([id, text]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = text;
      }
    });
  };
// Dynamic rendering of localized strings
const renderPageText = () => {
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'index.html') {
        applyLocalization({
        'index-title': messages.indexTitle,
        'index-subtitle': messages.indexSubtitle,
        'go-to-writer': messages.goToWriter,
        'go-to-reader': messages.goToReader,
        });
    } else if (currentPage === 'writer.html') {
        applyLocalization({
        'writer-title': messages.writerPageTitle,
        'last-saved': `${messages.lastSaved} Never`,
        'add-note': messages.addNote,
        'back-to-index': messages.backToIndex,
        });
    } else if (currentPage === 'reader.html') {
        applyLocalization({
        'reader-title': messages.readerPageTitle,
        'last-retrieved': `${messages.lastRetrieved} Never`,
        'back-to-index': messages.backToIndex,
        });
    }
};
renderPageText();


// Load notes from localStorage
const loadNotes = () => {
  const notes = JSON.parse(localStorage.getItem('notes')) || [];
  notesContainer.innerHTML = '';
  notes.forEach((note, index) => {
    const noteDiv = document.createElement('div');
    noteDiv.className = 'note-container';
    const textarea = document.createElement('textarea');
    textarea.value = note;
    textarea.dataset.index = index;
    textarea.placeholder = messages.addNotePlaceholder;

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.className = 'btn btn-danger';
    removeButton.addEventListener('click', () => {
      notes.splice(index, 1);
      saveNotes(notes);
      loadNotes();
    });

    noteDiv.appendChild(textarea);
    noteDiv.appendChild(removeButton);
    notesContainer.appendChild(noteDiv);
  });
};

// Save notes to localStorage
const saveNotes = (notes) => {
  localStorage.setItem('notes', JSON.stringify(notes));
  if (lastSavedEl) {
    lastSavedEl.textContent = `Last saved: ${new Date().toLocaleTimeString()}`;
  }
};

// Add new note
if (addNoteButton) {
  addNoteButton.addEventListener('click', () => {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.push('');
    saveNotes(notes);
    loadNotes();
  });
}

// Auto-save notes every 2 seconds for writer.html
if (lastSavedEl) {
  setInterval(() => {
    const notes = Array.from(notesContainer.querySelectorAll('textarea')).map(
      (textarea) => textarea.value
    );
    saveNotes(notes);
  }, FETCH_DATA_INTERVAL);

  // Initial load for writer.html
  loadNotes();
}

// Auto-retrieve notes every 2 seconds for reader.html
if (lastRetrievedEl) {
  const refreshNotes = () => {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notesContainer.innerHTML = '';
    notes.forEach((note) => {
      const noteDiv = document.createElement('div');
      const textarea = document.createElement('textarea');
      textarea.value = note;
      textarea.disabled = true;
      noteDiv.appendChild(textarea);
      notesContainer.appendChild(noteDiv);
    });
    lastRetrievedEl.textContent = `Last retrieved: ${new Date().toLocaleTimeString()}`;
  };

  // Initial load for reader.html
  refreshNotes();

  // Auto-refresh every 2 seconds
  setInterval(refreshNotes, FETCH_DATA_INTERVAL);
}



/*
    I acknowledgthe use of chat-gpt to help write this code.
*/
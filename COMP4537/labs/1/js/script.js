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
    if (document.getElementById('index-page-container')) {
        applyLocalization({
        'index-title': messages.indexTitle,
        'index-subtitle': messages.indexSubtitle,
        'go-to-writer': messages.goToWriter,
        'go-to-reader': messages.goToReader,
        });
    } else if (document.getElementById('writer-page-container')) {
        applyLocalization({
        'writer-title': messages.writerPageTitle,
        'last-saved': `${messages.lastSaved} ${messages.never}`,
        'add-note': messages.addNote,
        'back-to-index': messages.backToIndex,
        });
    } else if (document.getElementById('reader-page-container')) {
        applyLocalization({
        'reader-title': messages.readerPageTitle,
        'last-retrieved': `${messages.lastRetrieved} ${messages.never}`,
        'back-to-index': messages.backToIndex,
        });
    }
};
renderPageText();

class Note {
  constructor(content, index) {
    this.content = content;
    this.index = index;

    // Create the DOM elements for the note
    this.noteDiv = document.createElement('div');
    this.textarea = document.createElement('textarea');
    this.removeButton = document.createElement('button');

    this.init();
  }

  // Initialize the elements and event listeners for each note
  init() {
    this.textarea.value = this.content;
    this.textarea.placeholder = messages.addNotePlaceholder;
    this.textarea.dataset.index = this.index;

    this.removeButton.textContent = messages.remove;
    this.removeButton.className = 'btn btn-danger';
    this.removeButton.addEventListener('click', () => this.remove());

    // Append the textarea and button to the note div
    this.noteDiv.className = 'note-container';
    this.noteDiv.appendChild(this.textarea);
    this.noteDiv.appendChild(this.removeButton);
  }

  // Remove the note from DOM and localStorage
  remove() {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.splice(this.index, 1);
    saveNotes(notes);
    loadNotes();
  }

  // Save the note content to localStorage
  save() {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes[this.index] = this.textarea.value;
    saveNotes(notes);
  }
}

// Load notes from localStorage and render them
const loadNotes = () => {
  const notes = JSON.parse(localStorage.getItem('notes')) || [];
  notesContainer.innerHTML = '';
  notes.forEach((noteContent, index) => {
    const note = new Note(noteContent, index);
    notesContainer.appendChild(note.noteDiv);
  });
};

// Save notes to localStorage
const saveNotes = (notes) => {
  localStorage.setItem('notes', JSON.stringify(notes));
  if (lastSavedEl) {
    lastSavedEl.textContent = `${messages.lastSaved}: ${new Date().toLocaleTimeString()}`;
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

// Auto-save notes 
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

// Auto-retrieve notes
if (lastRetrievedEl) {
  const refreshNotes = () => {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notesContainer.innerHTML = '';
    notes.forEach((noteContent) => {
      const noteDiv = document.createElement('div');
      const textarea = document.createElement('textarea');
      textarea.value = noteContent;
      textarea.disabled = true;
      noteDiv.appendChild(textarea);
      notesContainer.appendChild(noteDiv);
    });
    lastRetrievedEl.textContent = `${messages.lastRetrieved}: ${new Date().toLocaleTimeString()}`;
  };

  // Initial load for reader.html
  refreshNotes();

  // Auto-refresh 
  setInterval(refreshNotes, FETCH_DATA_INTERVAL);
}

// UNCOMMENT THIS IF WE WANT TO ENABLE SAVING NOTES WHEN NAVIGATING BACK TO INDEX PAGE
// const backToIndexButton = document.getElementById('back-to-index');
// if (backToIndexButton) {
//   backToIndexButton.addEventListener('click', (event) => {
//     // Prevent default navigation to ensure we can save first
//     event.preventDefault();
    
//     const notes = Array.from(notesContainer.querySelectorAll('textarea')).map(
//       (textarea) => textarea.value
//     );
//     saveNotes(notes);

//     setTimeout(() => {
//       window.location.href = '../index.html'; 
//     }, 500); // Delay navigation to allow for note saving
//   });
// }


/*
    I acknowledge the use of chat-gpt to help write this code.
*/
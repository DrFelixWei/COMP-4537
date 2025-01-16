// Common constants
const lastSavedEl = document.getElementById('last-saved');
const lastRetrievedEl = document.getElementById('last-retrieved');
const notesContainer = document.getElementById('notes-container');
const addNoteButton = document.getElementById('add-note');

// Load notes from localStorage
const loadNotes = () => {
  const notes = JSON.parse(localStorage.getItem('notes')) || [];
  notesContainer.innerHTML = '';
  notes.forEach((note, index) => {
    const noteDiv = document.createElement('div');
    const textarea = document.createElement('textarea');
    textarea.value = note;
    textarea.dataset.index = index;

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.className = 'btn';
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
  }, 2000);

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
  setInterval(refreshNotes, 2000);
}



/*
    I acknowledgthe use of chat-gpt to help write this code.
*/
// API Configuration
const API_BASE_URL = 'https://techlearn-hla8.onrender.com/api';

// DOM Elements
const htmlEditorTextarea = document.getElementById('htmlEditor');
const cssEditorTextarea = document.getElementById('cssEditor');
const jsEditorTextarea = document.getElementById('jsEditor');
const previewFrame = document.getElementById('preview');
const tabs = document.querySelectorAll('.tab');
const runBtn = document.getElementById('runBtn');
const saveBtn = document.getElementById('saveBtn');
const statusText = document.getElementById('statusText');
const currentTabText = document.getElementById('currentTabText');
const lastSavedSpan = document.getElementById('lastSaved');
const exerciseInfoPanel = document.querySelector('.exercise-info-panel');
const toggleInfoBtn = document.getElementById('toggleInfoBtn'); // New button
const closeInfoPanelBtn = document.getElementById('closeInfoPanel');
const exerciseTitleElement = document.getElementById('exerciseTitle');
const exerciseTheoryElement = document.getElementById('exerciseTheory');
const exerciseDescriptionElement = document.getElementById('exerciseDescription');
const appContainer = document.querySelector('.app'); // To apply class for shifting content
const dashboardBtn = document.getElementById('dashboardBtn'); // New button
const scrollToTopBtn = document.getElementById('scrollToTopBtn');

// State variables
let editors = {};
let activeTab = 'html';
let autoSaveInterval = null;
let currentExerciseId = null; // To store the fetched exercise ID

// Initialize CodeMirror editors
function initializeEditors(initialCode = { html: '', css: '', js: '' }) {
    console.log('Initializing CodeMirror editors...');
    
    const editorConfig = {
        theme: 'monokai',
        lineNumbers: true,
        autoCloseTags: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 2,
        tabSize: 2,
        lineWrapping: true,
        readOnly: false,
        autofocus: false,
        extraKeys: {
            "Ctrl-Space": "autocomplete",
            "Tab": function(cm) {
                if (cm.somethingSelected()) {
                    cm.indentSelection("add");
                } else {
                    cm.replaceSelection("  ", "end");
                }
            }
        }
    };

    try {
        console.log('Attempting to initialize CodeMirror instances...');
        editors.html = CodeMirror.fromTextArea(htmlEditorTextarea, { ...editorConfig, mode: 'htmlmixed' });
        editors.css = CodeMirror.fromTextArea(cssEditorTextarea, { ...editorConfig, mode: 'css' });
        editors.js = CodeMirror.fromTextArea(jsEditorTextarea, { ...editorConfig, mode: 'javascript' });

        console.log('CodeMirror instances created:', editors);

        // Load initial or saved code
        editors.html.setValue(initialCode.html || '');
        editors.css.setValue(initialCode.css || '');
        editors.js.setValue(initialCode.js || '');

        // Add change event listeners for auto-save and preview update
        Object.values(editors).forEach(editor => {
            editor.on("change", debounce(() => {
                updatePreview();
                autoSave();
            }, 500)); // Debounce to prevent saving on every keystroke
        });

        // Add focus listener to set active tab on editor focus
        Object.keys(editors).forEach(lang => {
            editors[lang].on("focus", () => {
                switchTab(lang);
            });
        });

        // Initial focus and preview update
        setTimeout(() => {
             editors.html.refresh();
             editors.css.refresh();
             editors.js.refresh();
            // Determine which tab to focus based on loaded code or default to html
            if (initialCode.js) { // If JS has code, focus JS
                editors.js.focus();
                switchTab('js');
            } else if (initialCode.css) { // If CSS has code, focus CSS
                 editors.css.focus();
                 switchTab('css');
            } else { // Otherwise, focus HTML
                editors.html.focus();
                switchTab('html');
            }
            updatePreview();
            updateStatus('Editors ready');
        }, 100);

    } catch (error) {
        console.error('Error initializing editors:', error);
        updateStatus('Editor initialization failed', true);
    }
}

// Fetch exercise details
async function fetchExerciseDetails(exerciseId) {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No token found');
        updateStatus('Authentication error', true);
        return null;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/exercises/${exerciseId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch exercise details: ${response.status} ${response.statusText}`);
        }

        const exercise = await response.json();
        console.log('Exercise details fetched:', exercise);
        
        // Populate info panel
        if (exerciseTitleElement) exerciseTitleElement.textContent = exercise.title || 'N/A';
        if (exerciseTheoryElement) exerciseTheoryElement.innerHTML = exercise.theory || 'N/A'; // Use innerHTML for potential rich text
        if (exerciseDescriptionElement) exerciseDescriptionElement.innerHTML = exercise.description || 'N/A'; // Use innerHTML

        return exercise;
    } catch (error) {
        console.error('Error fetching exercise details:', error);
        updateStatus('Failed to load exercise', true);
        // Populate info panel with error message
        if (exerciseTitleElement) exerciseTitleElement.textContent = 'Error';
        if (exerciseTheoryElement) exerciseTheoryElement.textContent = 'Could not load exercise details.';
        if (exerciseDescriptionElement) exerciseDescriptionElement.textContent = '';
        return null;
    }
}

// Fetch user progress
async function fetchUserProgress(exerciseId) {
     const token = localStorage.getItem('token');
     if (!token) {
        console.error('No token found for fetching progress');
        return null;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/progress/${exerciseId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 404) {
            console.log('No saved progress found for this exercise.');
            return null; // No saved progress
        }

        if (!response.ok) {
            throw new Error(`Failed to fetch progress: ${response.status} ${response.statusText}`);
        }

        const progress = await response.json();
        console.log('User progress fetched:', progress);
        return progress;
    } catch (error) {
        console.error('Error fetching user progress:', error);
        updateStatus('Failed to load saved progress', true);
        return null;
    }
}

// Save user progress
async function saveUserProgress(exerciseId, codeState) {
     const token = localStorage.getItem('token');
     if (!token) {
        console.error('No token found for saving progress');
        return;
    }
    try {
        updateStatus('Saving...');
        const response = await fetch(`${API_BASE_URL}/progress/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ exerciseId, codeState: JSON.stringify(codeState) })
        });

        if (!response.ok) {
            throw new Error(`Failed to save progress: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Progress saved:', result);
        updateStatus('Saved');
        if (lastSavedSpan) {
            const now = new Date();
            lastSavedSpan.textContent = `Saved at ${now.toLocaleTimeString()}`;
        }

    } catch (error) {
        console.error('Error saving user progress:', error);
        updateStatus('Save failed!', true);
    }
}

// Auto-save functionality
function autoSave() {
    if (!currentExerciseId) return; // Only auto-save if an exercise is loaded

    const codeState = {
        html: editors.html ? editors.html.getValue() : '',
        css: editors.css ? editors.css.getValue() : '',
        js: editors.js ? editors.js.getValue() : ''
    };
    
    // Implement debounce or throttling for auto-save if needed
    saveUserProgress(currentExerciseId, codeState);
}

// Update preview iframe
function updatePreview() {
    console.log('Updating preview...');
    if (!previewFrame) {
        console.warn('Preview frame not found.');
        return;
    }

    const htmlCode = editors.html ? editors.html.getValue() : '';
    const cssCode = editors.css ? editors.css.getValue() : '';
    const jsCode = editors.js ? editors.js.getValue() : '';

    const srcDoc = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>${cssCode}</style>
        </head>
        <body>
            ${htmlCode}
            <script>
                try {
                    ${jsCode}
                } catch(e) {
                    console.error('JavaScript Error:', e);
                }
            </script>
        </body>
        </html>`;

    // Add a simple class to indicate updating state (optional)
    // previewFrame.classList.add("updating");
    previewFrame.srcdoc = srcDoc;
    // setTimeout(() => previewFrame.classList.remove("updating"), 300);
}

// Switch between code editor tabs
function switchTab(lang) {
     if (!editors[lang]) return; // Prevent switching to a non-existent editor

    // Update active tab button
    tabs.forEach(tab => tab.classList.remove('active'));
    const targetTab = document.querySelector(`.tab[data-tab="${lang}"]`);
    if (targetTab) targetTab.classList.add('active');

    // Hide all editors and show the active one
    document.querySelectorAll('.editor').forEach(editor => editor.classList.remove('active'));
    const activeEditorElement = document.getElementById(`${lang}Editor`);
    if (activeEditorElement) activeEditorElement.classList.add('active');

    // Update status bar language
    if (currentTabText) currentTabText.textContent = lang.toUpperCase();

    // Refresh and focus the active editor to ensure it renders correctly
    const activeEditor = editors[lang];
    if (activeEditor) {
        activeEditor.refresh();
        activeEditor.focus();
    }
    activeTab = lang;
}

// Update status bar text and indicator
function updateStatus(message, isError = false) {
    if (statusText) {
        statusText.textContent = message;
        const statusDot = statusText.previousElementSibling;
        if (statusDot) {
            statusDot.classList.toggle('error', isError);
            statusDot.classList.toggle('running', message === 'Running...');
        }
    }
}

// Helper function for debouncing
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Event Listeners
// Tab switching
tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

// Scroll to Top Button
if (scrollToTopBtn) {
    // Show button when page is scrolled down
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });

    // Scroll to top when button is clicked
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Run button
if (runBtn) {
    runBtn.addEventListener('click', () => {
        updateStatus('Running...');
        updatePreview(); // Update preview instantly
        // Simulate a short running time
        setTimeout(() => updateStatus('Ready'), 500);
    });
}

// Save button
if (saveBtn) {
    saveBtn.addEventListener('click', () => {
        if (currentExerciseId) {
             const codeState = {
                html: editors.html ? editors.html.getValue() : '',
                css: editors.css ? editors.css.getValue() : '',
                js: editors.js ? editors.js.getValue() : ''
            };
            saveUserProgress(currentExerciseId, codeState);
        } else {
            updateStatus('No exercise loaded to save', true);
        }
    });
}

// Toggle info panel button
if (toggleInfoBtn) {
    toggleInfoBtn.addEventListener('click', () => {
        if (exerciseInfoPanel) exerciseInfoPanel.classList.add('active');
        if (appContainer) appContainer.classList.add('info-panel-active');
    });
}

// Close info panel button
if (closeInfoPanelBtn) {
    closeInfoPanelBtn.addEventListener('click', () => {
        if (exerciseInfoPanel) exerciseInfoPanel.classList.remove('active');
         if (appContainer) appContainer.classList.remove('info-panel-active');
    });
}

// Dashboard button
if (dashboardBtn) {
    dashboardBtn.addEventListener('click', () => {
        console.log('Navigating to dashboard...');
        window.location.href = 'dashboard.html';
    });
}

// Initialize the compiler
async function initializeCompiler() {
    console.log('Initializing compiler...');
    updateStatus('Loading exercise...');

    // Get exercise ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const exerciseId = parseInt(urlParams.get('exerciseId'), 10);

    if (isNaN(exerciseId)) {
        console.error('Invalid exercise ID in URL');
        updateStatus('Error: Invalid exercise ID', true);
        return;
    }

    currentExerciseId = exerciseId;

    // Fetch exercise details and user progress concurrently
    const [exerciseDetails, savedProgress] = await Promise.all([
        fetchExerciseDetails(exerciseId),
        fetchUserProgress(exerciseId)
    ]);

    if (!exerciseDetails) {
        updateStatus('Failed to load exercise data', true);
        return;
    }

    // Determine initial code state
    const initialCode = savedProgress && savedProgress.codeState 
        ? JSON.parse(savedProgress.codeState) 
        : { html: exerciseDetails.starterCode || '', css: '', js: '' };

    // Initialize editors with loaded or starter code
    initializeEditors(initialCode);

    updateStatus('Ready');

    // Set up auto-save (optional: implement periodic saving in autoSave function)
    // autoSaveInterval = setInterval(autoSave, 30000); // Auto-save every 30 seconds
}

// Initialize compiler when DOM is ready
document.addEventListener('DOMContentLoaded', initializeCompiler);

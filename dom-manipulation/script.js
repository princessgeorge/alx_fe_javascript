// ===== Dynamic Quote Generator with Filtering, Storage, JSON, and Server Sync =====

// Load quotes from localStorage or initialize default
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { id: 1, text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { id: 2, text: "Life is what happens when you’re busy making other plans.", category: "Life" },
  { id: 3, text: "In the middle of every difficulty lies opportunity.", category: "Motivation" },
  { id: 4, text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration" },
];

// DOM Elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const exportBtn = document.getElementById('exportBtn');
const importFileInput = document.getElementById('importFile');
const categoryFilter = document.getElementById('categoryFilter');
const syncBtn = document.getElementById('syncBtn');
const syncStatus = document.getElementById('syncStatus');
const categoryList = document.getElementById('categoryList');

// ===== Helper Functions =====

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function loadQuotes() {
  const storedQuotes = JSON.parse(localStorage.getItem('quotes'));
  if (storedQuotes) quotes = storedQuotes;
}

// ===== Display and Filtering =====

function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem('lastCategory', selectedCategory);

  const filteredQuotes =
    selectedCategory === 'all'
      ? quotes
      : quotes.filter((q) => q.category.toLowerCase() === selectedCategory.toLowerCase());

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes available in this category.</p>`;
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];

  quoteDisplay.innerHTML = `
    <blockquote>"${quote.text}"</blockquote>
    <p><em>Category:</em> ${quote.category}</p>
  `;

  sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

function populateCategories() {
  const uniqueCategories = [...new Set(quotes.map((q) => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  uniqueCategories.forEach((cat) => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const lastCategory = localStorage.getItem('lastCategory');
  if (lastCategory) categoryFilter.value = lastCategory;
}

function displayCategories() {
  const uniqueCategories = [...new Set(quotes.map((q) => q.category))];
  categoryList.innerHTML = '<h3>Categories:</h3>';
  uniqueCategories.forEach((category) => {
    const btn = document.createElement('button');
    btn.textContent = category;
    btn.style.margin = '5px';
    btn.addEventListener('click', () => filterQuotesByButton(category));
    categoryList.appendChild(btn);
  });
}

function filterQuotesByButton(category) {
  categoryFilter.value = category;
  filterQuotes();
}

// ===== Add, Export, Import =====

function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');
  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (!newText || !newCategory) {
    alert('Please enter both a quote and a category!');
    return;
  }

  const newQuote = {
    id: Date.now(), // unique id
    text: newText,
    category: newCategory,
  };

  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  displayCategories();
  textInput.value = '';
  categoryInput.value = '';
  alert('Quote added successfully!');
}

function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'quotes.json';
  link.click();
  URL.revokeObjectURL(url);
  alert('Quotes exported as JSON file!');
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        displayCategories();
        alert('Quotes imported successfully!');
      } else {
        alert('Invalid JSON format.');
      }
    } catch (err) {
      alert('Error reading JSON file.');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ===== Simulated Server Sync =====

// Fetch simulated quotes from "server"
async function fetchServerQuotes() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
    const data = await response.json();

    // Convert to our quote format
    return data.map((item) => ({
      id: item.id,
      text: item.title,
      category: 'Server',
    }));
  } catch (error) {
    console.error('Server fetch failed:', error);
    return [];
  }
}

// Sync local data with server data
async function syncWithServer() {
  syncStatus.textContent = 'Syncing with server... ⏳';
  const serverQuotes = await fetchServerQuotes();

  if (serverQuotes.length === 0) {
    syncStatus.textContent = 'No new updates from server.';
    return;
  }

  // Conflict Resolution Strategy: Server data takes precedence
  const mergedQuotes = [...quotes];

  serverQuotes.forEach((serverQuote) => {
    const localIndex = mergedQuotes.findIndex((q) => q.id === serverQuote.id);
    if (localIndex === -1) {
      mergedQuotes.push(serverQuote); // new quote from server
    } else if (mergedQuotes[localIndex].text !== serverQuote.text) {
      mergedQuotes[localIndex] = serverQuote; // replace conflicting quote
    }
  });

  const conflictsResolved = mergedQuotes.length - quotes.length;
  quotes = mergedQuotes;
  saveQuotes();
  populateCategories();
  displayCategories();

  syncStatus.textContent =
    conflictsResolved > 0
      ? `Sync complete. ${conflictsResolved} conflicts resolved ✅`
      : 'Sync complete. No conflicts found.';
}

// ===== Event Listeners =====

newQuoteBtn.addEventListener('click', filterQuotes);
addQuoteBtn.addEventListener('click', addQuote);
exportBtn.addEventListener('click', exportToJsonFile);
importFileInput.addEventListener('change', importFromJsonFile);
syncBtn.addEventListener('click', syncWithServer);

// ===== Initialize =====

loadQuotes();
populateCategories();
displayCategories();
const lastCategory = localStorage.getItem('lastCategory') || 'all';
categoryFilter.value = lastCategory;
filterQuotes();

// Auto-sync every 30 seconds
setInterval(syncWithServer, 30000);

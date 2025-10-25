// ===== Dynamic Quote Generator with Storage, JSON, and Category Filtering =====

// Initialize quotes (load from localStorage if available)
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Motivation" },
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration" },
];

// DOM Elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');

// ===== Helper Functions =====
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = JSON.parse(localStorage.getItem('quotes'));
  if (stored) quotes = stored;
}

// ===== Quote Display =====
function showRandomQuote(category = null) {
  let filtered = category
    ? quotes.filter(q => q.category.toLowerCase() === category.toLowerCase())
    : quotes;

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes available in this category.</p>`;
    return;
  }

  const random = Math.floor(Math.random() * filtered.length);
  const quote = filtered[random];

  quoteDisplay.innerHTML = `
    <blockquote>"${quote.text}"</blockquote>
    <p><em>Category:</em> ${quote.category}</p>
  `;

  // Save last viewed quote in sessionStorage
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

// ===== Create Add Quote Form =====
function createAddQuoteForm() {
  const formContainer = document.createElement('div');
  formContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteBtn">Add Quote</button>
    <hr>
    <label for="categorySelect">Filter by Category:</label>
    <select id="categorySelect"></select>
    <hr>
    <button id="exportBtn">Export Quotes (JSON)</button>
    <input type="file" id="importFile" accept=".json" />
  `;
  document.body.appendChild(formContainer);

  // Add event listeners
  document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
  document.getElementById('exportBtn').addEventListener('click', exportToJsonFile);
  document.getElementById('importFile').addEventListener('change', importFromJsonFile);
  document.getElementById('categorySelect').addEventListener('change', filterQuote);
}

// ===== Add a New Quote =====
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert('Please enter both a quote and a category!');
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  textInput.value = '';
  categoryInput.value = '';
  alert('Quote added successfully!');
}

// ===== Populate Categories (Dropdown) =====
function populateCategories() {
  const select = document.getElementById('categorySelect');
  if (!select) return;

  // Clear old options
  select.innerHTML = `<option value="all">All Categories</option>`;

  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  uniqueCategories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  // Restore last selected category
  const savedCategory = localStorage.getItem('selectedCategory');
  if (savedCategory) {
    select.value = savedCategory;
  }
}

// ===== Filter Quotes =====
function filterQuote() {
  const select = document.getElementById('categorySelect');
  const selected = select.value;

  // Save selected category
  localStorage.setItem('selectedCategory', selected);

  if (selected === 'all') {
    showRandomQuote();
  } else {
    showRandomQuote(selected);
  }
}

// ===== JSON Export =====
function exportToJsonFile() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}

// ===== JSON Import =====
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert('Quotes imported successfully!');
      } else {
        alert('Invalid JSON format.');
      }
    } catch {
      alert('Error reading JSON file.');
    }
  };
  reader.readAsText(event.target.files[0]);
}

// ===== Event Listener for New Quote =====
newQuoteBtn.addEventListener('click', () => {
  const savedCategory = localStorage.getItem('selectedCategory');
  showRandomQuote(savedCategory === 'all' ? null : savedCategory);
});

// ===== Initialize App =====
loadQuotes();
createAddQuoteForm();
populateCategories();

// Restore last viewed quote or show random
const lastQuote = JSON.parse(sessionStorage.getItem('lastViewedQuote'));
if (lastQuote) {
  quoteDisplay.innerHTML = `
    <blockquote>"${lastQuote.text}"</blockquote>
    <p><em>Category:</em> ${lastQuote.category}</p>
  `;
} else {
  const savedCategory = localStorage.getItem('selectedCategory');
  showRandomQuote(savedCategory === 'all' ? null : savedCategory);
}

// ===== Dynamic Quote Generator with Web Storage & JSON Handling =====

// Initialize quotes array (load from localStorage if available)
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Motivation" },
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration" },
];

// DOM Elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryList = document.getElementById('categoryList');

// ===== Helper Functions =====

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Load quotes from local storage
function loadQuotes() {
  const storedQuotes = JSON.parse(localStorage.getItem('quotes'));
  if (storedQuotes) quotes = storedQuotes;
}

// ===== DOM Manipulation Functions =====

// Display a random quote (optionally by category)
function showRandomQuote(category = null) {
  let filteredQuotes = category
    ? quotes.filter(q => q.category.toLowerCase() === category.toLowerCase())
    : quotes;

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

  // Save last viewed quote in sessionStorage
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

// Create and display category buttons dynamically
function displayCategories() {
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  categoryList.innerHTML = '<h3>Categories:</h3>';

  uniqueCategories.forEach(category => {
    const btn = document.createElement('button');
    btn.textContent = category;
    btn.style.margin = '5px';
    btn.addEventListener('click', () => showRandomQuote(category));
    categoryList.appendChild(btn);
  });
}

// ===== Add Quote Form =====
function createAddQuoteForm() {
  const formContainer = document.createElement('div');
  formContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteBtn">Add Quote</button>
    <hr>
    <button id="exportBtn">Export Quotes (JSON)</button>
    <input type="file" id="importFile" accept=".json" />
  `;
  document.body.appendChild(formContainer);

  // Add event listeners
  document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
  document.getElementById('exportBtn').addEventListener('click', exportToJsonFile);
  document.getElementById('importFile').addEventListener('change', importFromJsonFile);
}

// ===== Add a New Quote =====
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (!newText || !newCategory) {
    alert('Please enter both a quote and a category!');
    return;
  }

  quotes.push({ text: newText, category: newCategory });
  saveQuotes(); // persist to localStorage
  displayCategories(); // refresh categories
  textInput.value = '';
  categoryInput.value = '';
  alert('Quote added successfully!');
}

// ===== JSON Export =====
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();

  URL.revokeObjectURL(url);
  alert('Quotes exported as JSON file!');
}

// ===== JSON Import =====
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
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

// ===== Event Listeners =====
newQuoteBtn.addEventListener('click', () => showRandomQuote());

// ===== Initialize App =====
loadQuotes();
createAddQuoteForm();
displayCategories();

// Display last viewed quote if available
const lastQuote = JSON.parse(sessionStorage.getItem('lastViewedQuote'));
if (lastQuote) {
  quoteDisplay.innerHTML = `
    <blockquote>"${lastQuote.text}"</blockquote>
    <p><em>Category:</em> ${lastQuote.category}</p>
  `;
} else {
  showRandomQuote();
}

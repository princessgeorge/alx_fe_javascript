// ===== Dynamic Quote Generator with Server Sync & Conflict Resolution =====

// Load quotes from localStorage or default
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
  const newCategory = category

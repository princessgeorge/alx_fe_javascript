// Initial quotes array with categories
let quotes = [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Motivation" },
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration" },
];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const categoryList = document.getElementById('categoryList');

// Function to show a random quote
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
}

// Function to add a new quote
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (!newText || !newCategory) {
    alert('Please enter both a quote and a category!');
    return;
  }

  // Add new quote to array
  quotes.push({ text: newText, category: newCategory });

  // Clear input fields
  textInput.value = '';
  categoryInput.value = '';

  // Refresh categories
  displayCategories();

  alert('Quote added successfully!');
}

// Function to display categories dynamically
function displayCategories() {
  // Get unique categories
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

// Event listeners
newQuoteBtn.addEventListener('click', () => showRandomQuote());
addQuoteBtn.addEventListener('click', addQuote);

// Initial display
showRandomQuote();
displayCategories();

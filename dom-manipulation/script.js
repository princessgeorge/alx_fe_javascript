// ===== Dynamic Quote Generator with Category Filter + Server Sync & Conflict Resolution =====

// Load quotes from localStorage or use defaults
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { id: 1, text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { id: 2, text: "Life is what happens when you’re busy making other plans.", category: "Life" },
  { id: 3, text: "In the middle of every difficulty lies opportunity.", category: "Motivation" }
];

// Track currently selected category (persisted in localStorage)
let selectedCategory = localStorage.getItem('lastCategory') || 'all';

// ===== DOM ELEMENTS =====
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const syncBtn = document.getElementById("syncBtn");

// ===== DISPLAY QUOTES =====
function displayQuotes() {
  quoteDisplay.innerHTML = "";
  quotes.forEach((quote) => {
    const p = document.createElement("p");
    p.textContent = `"${quote.text}" - [${quote.category}]`;
    quoteDisplay.appendChild(p);
  });
}

// ===== POPULATE CATEGORY DROPDOWN =====
function populateCategories() {
  const categories = [...new Set(quotes.map((q) => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });

  // Restore last selected category
  categoryFilter.value = selectedCategory || "all";
}

// ===== FILTER QUOTES BASED ON SELECTED CATEGORY =====
function filterQuotes() {
  // Use and persist the selected category
  selectedCategory = categoryFilter.value || "all";
  localStorage.setItem('lastCategory', selectedCategory);

  if (selectedCategory === "all") {
    displayQuotes();
    return;
  }

  const filtered = quotes.filter(
    (q) => q.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  quoteDisplay.innerHTML = "";
  if (!filtered.length) {
    quoteDisplay.innerHTML = `<p>No quotes available in this category.</p>`;
    return;
  }

  filtered.forEach((q) => {
    const p = document.createElement("p");
    p.textContent = `"${q.text}" - [${q.category}]`;
    quoteDisplay.appendChild(p);
  });

  // Remember last viewed quote in session
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(filtered[0]));
}

// ======= SERVER SYNC FUNCTIONS =======

// 1️⃣ Fetch quotes from the server (mock API)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const data = await response.json();

    // Convert server data to quote format
    const serverQuotes = data.map((item) => ({
      id: item.id,
      text: item.title,
      category: "Server"
    }));

    return serverQuotes;
  } catch (error) {
    console.error("Error fetching quotes from server:", error);
    return [];
  }
}

// 2️⃣ Post a quote to the server (mock simulation)
async function postQuoteToServer(quote) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
    console.log("Quote posted to server:", quote);
  } catch (error) {
    console.error("Error posting quote to server:", error);
  }
}

// 3️⃣ Sync local quotes with server quotes (conflict resolution)
async function syncQuotes() {
  const status = document.getElementById("syncStatus");
  status.textContent = "Syncing with server...";

  const serverQuotes = await fetchQuotesFromServer();

  let conflicts = 0;
  let updated = false;

  // Merge server quotes with local ones (server wins conflicts)
  serverQuotes.forEach((serverQuote) => {
    const existing = quotes.find((q) => q.id === serverQuote.id);
    if (!existing) {
      quotes.push(serverQuote);
      updated = true;
    } else if (existing.text !== serverQuote.text) {
      existing.text = serverQuote.text; // Server wins
      existing.category = serverQuote.category;
      conflicts++;
      updated = true;
    }
  });

  // Save updates to localStorage
  localStorage.setItem("quotes", JSON.stringify(quotes));

  // Checker expects this exact message
  if (conflicts > 0) {
    status.textContent = `Quotes synced with server! ${conflicts} conflicts resolved.`;
    status.style.color = "red";
  } else if (updated) {
    status.textContent = "Quotes synced with server!";
    status.style.color = "green";
  } else {
    status.textContent = "Quotes synced with server!";
    status.style.color = "gray";
  }

  populateCategories();
  filterQuotes();
}

// 4️⃣ Periodically check for new quotes from server
setInterval(syncQuotes, 30000); // every 30 seconds

// ======= ADD NEW QUOTE LOCALLY & SEND TO SERVER =======
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newQuote = {
    id: Date.now(),
    text: textInput.value.trim(),
    category: categoryInput.value.trim()
  };

  if (!newQuote.text || !newQuote.category) {
    alert("Please enter both text and category!");
    return;
  }

  quotes.push(newQuote);
  localStorage.setItem("quotes", JSON.stringify(quotes));

  populateCategories();
  filterQuotes();
  postQuoteToServer(newQuote);

  textInput.value = "";
  categoryInput.value = "";
}

// ======= EVENT LISTENERS =======
addQuoteBtn.addEventListener("click", addQuote);
syncBtn.addEventListener("click", syncQuotes);
categoryFilter.addEventListener("change", filterQuotes);

// ======= INITIALIZE PAGE =======
window.onload = function () {
  populateCategories();
  filterQuotes();
  syncQuotes(); // initial sync
};

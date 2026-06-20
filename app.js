const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const statusElement = document.getElementById("status");
const resultsElement = document.getElementById("results");

const API_KEY = "YOUR-API-KEY";
const OMDB_URL = "https://www.omdbapi.com/";

function setStatus(message, type = "") {
  statusElement.textContent = message;
  statusElement.className = "status";

  if (type) {
    statusElement.classList.add(type);
  }
}

function setLoadingState(isLoading) {
  searchBtn.disabled = isLoading;
  searchBtn.textContent = isLoading ? "Searching..." : "Search";
}

function clearResults() {
  resultsElement.innerHTML = "";
}

function getPosterUrl(poster) {
  return poster && poster !== "N/A"
    ? poster
    : "https://via.placeholder.com/300x450?text=No+Image";
}

function createMovieCard(movie) {
  const article = document.createElement("article");
  article.className = "movie-card";

  article.innerHTML = `
    <img
      class="movie-poster"
      src="${getPosterUrl(movie.Poster)}"
      alt="Poster for ${movie.Title}"
      onerror="this.onerror=null; this.src='https://via.placeholder.com/300x450?text=No+Image';"
    />
    <div class="movie-content">
      <h2 class="movie-title">${movie.Title}</h2>
      <p class="movie-info"><strong>Year:</strong> ${movie.Year}</p>
      <p class="movie-info"><strong>Type:</strong> ${movie.Type}</p>
    </div>
  `;

  return article;
}

function renderMovies(movies) {
  const fragment = document.createDocumentFragment();

  movies.forEach((movie) => {
    fragment.appendChild(createMovieCard(movie));
  });

  resultsElement.appendChild(fragment);
}

function renderEmptyState() {
  resultsElement.innerHTML = `
    <div class="empty-state">
      No results found.
    </div>
  `;
}

async function fetchMovies(searchTerm) {
  const url = new URL(OMDB_URL);
  url.searchParams.set("apikey", API_KEY);
  url.searchParams.set("s", searchTerm);

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error("Request failed.");
  }

  if (data.Response === "False") {
    throw new Error(data.Error || "No results found.");
  }

  return data;
}

async function handleSearch() {
  const searchTerm = searchInput.value.trim();

  if (!searchTerm) {
    clearResults();
    setStatus("Please enter a movie title.", "error");
    return;
  }

  try {
    setLoadingState(true);
    clearResults();
    setStatus("Loading...", "loading");

    const data = await fetchMovies(searchTerm);

    renderMovies(data.Search);
    setStatus(
      `Found ${data.Search.length} ${data.Search.length === 1 ? "movie" : "movies"}.`,
      "success"
    );
  } catch (error) {
    clearResults();
    renderEmptyState();
    setStatus(error.message || "Something went wrong.", "error");
    console.error("Movie search failed:", error);
  } finally {
    setLoadingState(false);
  }
}

searchBtn.addEventListener("click", handleSearch);

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleSearch();
  }
});

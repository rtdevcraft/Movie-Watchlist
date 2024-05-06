const watchListBtn = document.getElementById("watchlist-btn");
const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search-input");
const startImgEl = document.querySelector(".start-img");
const movieListEl = document.getElementById("movie-list");
const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

const apiKey = "c2f3dc6e";

searchBtn.addEventListener("click", searchMovies);
searchInput.addEventListener("keyup", function (e) {
  if (e.key === "Enter") {
    searchMovies(e);
  }
});

document.addEventListener("click", function (e) {
  const changeWatchlistButton = e.target.closest(".change-watchlist");
  if (changeWatchlistButton) {
    const imdbID = changeWatchlistButton.getAttribute("data-imdbid");
    const index = watchlist.indexOf(imdbID);
    if (index === -1) {
      watchlist.push(imdbID);
    } else {
      watchlist.splice(index, 1);
    }
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    const { buttonText, buttonImg, buttonClass } = getWatchListButtonInfo(
      watchlist,
      imdbID
    );
    changeWatchlistButton.innerHTML = `<img src="${buttonImg}" class="button-icon">${buttonText}`;
    changeWatchlistButton.className = `change-watchlist ${buttonClass}`;
  }
});

function searchMovies(e) {
  e.preventDefault();
  startImgEl.style.display = "none";
  const searchInputValue = encodeURIComponent(searchInput.value);
  const updatedWatchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  fetch(`http://www.omdbapi.com/?apikey=${apiKey}&s=${searchInputValue}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.Search) {
        renderMovieList(data.Search, updatedWatchlist);
      } else {
        movieListEl.innerHTML = `<h2 class="light-grey">Unable to find what you're looking for. Please try another search</h2>`;
      }
    })
    .catch((error) => {
      console.error("Error fetching movie data:", error);
    });
}

async function renderMovieList(data, watchlist) {
  movieListEl.innerHTML = "";
  if (data) {
    try {
      for (const movie of data) {
        const response = await fetch(
          `http://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}&plot=full`
        );
        const movieData = await response.json();

        const { buttonText, buttonImg, buttonClass } = getWatchListButtonInfo(
          watchlist,
          movieData.imdbID
        );

        movieListEl.innerHTML += `
          <li>
            <div class="movie-card">
              <div class="movie-poster">
                <img src="${
                  movieData.Poster !== "N/A"
                    ? movieData.Poster
                    : "/assets/notavailable.png"
                }" alt="${movieData.Title} Poster" />
              </div>
              <div class="movie-info">    
                <span class="movie-title">
                  <h3>${movieData.Title}</h3>
                  <p><img src="/assets/star-icon.png">${
                    movieData.Metascore !== "N/A"
                      ? `Metascore: ${movieData.Metascore}`
                      : `IMDb Rating: ${movieData.imdbRating}`
                  }</p>
                  <p>${movie.Year}</p>
                </span>
                <span class="movie-stats">
                  <p>${movieData.Runtime}</p><p>${
          movieData.Genre
        }</p><button class="change-watchlist ${buttonClass}" data-imdbid="${
          movieData.imdbID
        }">
        <img src="${buttonImg}">${buttonText}
          </button>
                </span>
                <span class="movie-plot">
                  <p>${movieData.Plot}</p>
                </span>    
              </div>
            </div>    
          </li>
          <hr>`;
      }
    } catch (error) {
      console.error("Error fetching movie data:", error);
    }
  }
}

function getWatchListButtonInfo(watchlist, imdbID) {
  const isInWatchlist = watchlist && watchlist.includes(imdbID);
  const buttonText = isInWatchlist
    ? "Remove from Watchlist"
    : "Add to Watchlist";
  const buttonImg = isInWatchlist ? "/assets/minus.png" : "/assets/plus.png";
  const buttonClass = isInWatchlist ? "remove" : "add";

  return { buttonText, buttonImg, buttonClass };
}

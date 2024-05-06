const apiKey = "c2f3dc6e";
const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

document.addEventListener("click", function (e) {
  const changeWatchlistButton = e.target.closest(".change-watchlist");
  if (changeWatchlistButton) {
    const imdbID = changeWatchlistButton.getAttribute("data-imdbid");
    const index = watchlist.indexOf(imdbID);
    if (index === -1) {
      watchlist.push(imdbID);
    } else {
      watchlist.splice(index, 1);
      const movieElement = changeWatchlistButton.closest("li");
      movieElement.parentNode.removeChild(movieElement);
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

getWatchListData();

function renderWatchList(data) {
  const watchListEl = document.getElementById("watchlist");
  watchListEl.innerHTML = "";
  document.getElementById("watchlist-empty").style.display = "none";
  data.forEach((movieData) => {
    if (watchlist.includes(movieData.imdbID)) {
      const { buttonText, buttonImg, buttonClass } = getWatchListButtonInfo(
        watchlist,
        movieData.imdbID
      );
      watchListEl.innerHTML += `
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
                <p>${movieData.Year}</p>
              </span>
              <span class="movie-stats">
                <p>${movieData.Runtime}</p>
                <p>${movieData.Genre}</p>
                <button class="change-watchlist ${buttonClass}" data-imdbid="${
        movieData.imdbID
      }"><img src="${buttonImg}">${buttonText}</button>
              </span>
              <span class="movie-plot">
                <p>${movieData.Plot}</p>
              </span>
            </div>
          </div>
        </li>
        <hr>`;
    }
  });

  if (watchlist.length === 0) {
    watchListEl.innerHTML = "";
    document.getElementById("watchlist-empty").style.display = "flex";
  }
}

async function getWatchListData() {
  try {
    const dataArray = await Promise.all(
      watchlist.map(async (movieId) => {
        const response = await fetch(
          `http://www.omdbapi.com/?apikey=${apiKey}&i=${movieId}&plot=full`
        );
        return await response.json();
      })
    );

    const movieArray = Object.values(dataArray);
    renderWatchList(movieArray);
  } catch (error) {
    console.error("Error fetching movie data:", error);
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

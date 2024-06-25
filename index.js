/*
<li class="song">
  <div class="song-img-container">
    <img src="album_img" />
  </div>
  <div class="song-details">
    <div class="song-name">song_name</div>
    <div class="song-album">
      album_name <span class="song-year">(album_year)</span>
    </div>
    <div class="song-artists">Artists_names comma seperated</div>
  </div>
</li>
*/

$(document).ready(function () {
  $.ajax({
    url: "https://ionized-songs-book.glitch.me/status",
    method: "GET",
    dataType: "json",
    success: function (data) {
      console.log(data);
      $("#full-screen-loader").fadeOut();
    },
    error: function () {
      alert("Some thing went wrong...");
    },
  });

  function renderSongs(songsToRender) {
    $("#songs-lister").empty();
    $.each(songsToRender, function (_, songObj) {
      const song = songObj;
      const li = $(
        `<li data-index=${songObj.index} onclick="changeSong(${songObj.index})">`
      ).addClass("song").html(`
          <div class="song-details">
            <div class="song-name">${song.original_name}</div>
            <div class="song-album">
              ${song.album.title} <span class="song-year">(${
        song.album.year
      })</span>
            </div>
            <div class="song-artists">${song.artists
              .map((artist) => artist.name)
              .join(", ")}</div>
          </div>
        `);
      $("#songs-lister").append(li);
    });

    $("#player")[0].crossOrigin = "anonymous";

    var audio = document.getElementById("player");
    var loader = $("#audio-processing");

    audio.addEventListener("loadstart", function () {
      loader.show();
    });

    audio.addEventListener("canplaythrough", function () {
      loader.hide();
    });

    audio.addEventListener("error", function () {
      loader.hide();
    });

    audio.addEventListener("playing", function () {
      loader.hide();
    });
  }

  function searchSongs(query) {
    return songs.filter(function (songObj) {
      const song = songObj;
      const searchString = `${song.original_name} ${song.album.title} ${
        song.album.year
      } ${song.genre.name} ${song.artists
        .map((artist) => artist.name)
        .join(" ")}`.toLowerCase();
      return searchString.includes(query.toLowerCase());
    });
  }

  $("#search-input").on("input", function () {
    const query = $(this).val();
    const filteredSongs = searchSongs(query);
    renderSongs(filteredSongs);
  });

  // Initial render
  renderSongs(songs);
});

function changeSong(index) {
  const song = songs[index];
  $("#player").attr("src", song.url);
  $("#player")[0].play();

  $("#current-song-details").html(`
    <div class="cur-song-img">
        <img src="${song.album.thumbnail}" />
      </div>
      <div class="cur-song-name">
      ${song.original_name}
      </div>`);
}

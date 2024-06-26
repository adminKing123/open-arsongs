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

  const savedIndex = storage.get_index();
  if (savedIndex !== null) showAlreadyPlayingSongPopup();

  initOptions();

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
    $("#audio-processing").text("Failed to load audio");
    setTimeout(() => {
      loader.hide();
      $("#audio-processing").text("Audio Processing");
    }, 1000);
  });

  audio.addEventListener("playing", function () {
    loader.hide();
  });

  audio.addEventListener("ended", handleSongEnded);

  $(".option").click(handleOptionClick);

  $("#no-a-s-s").click(() => $("#already-selected-song").fadeOut());
  $("#play-a-s-s").click(playAlreadySelectedSong);
});

const storage = {
  set_index: (index) => localStorage.setItem("index", index),
  get_index: () => localStorage.getItem("index"),
  set_option: (option) => localStorage.setItem("option", option),
  get_option: () => localStorage.getItem("option"),
};

function changeSong(index) {
  storage.set_index(index);

  const song = songs[index];
  $("#player").attr("src", song.url);
  $("#player")[0].play();

  $("#current-song-details").html(`
    <div class="cur-song-img">
        <img src="${song.album.thumbnail300x300}" />
      </div>
      <div class="cur-song-name">
      ${song.original_name}
      </div>`);
}

function handleSongEnded() {
  changeSongBasedOnOption();
}

function initOptions() {
  let option = storage.get_option() || $("#option_val").val() || "random";
  if (storage.get_option() === null) storage.set_option(option);

  $(`#${option}`).addClass("active");
  $("#option_val").val(option);
}

function changeOption(option) {
  storage.set_option(option);
  $(".option").removeClass("active");
  $(`#${option}`).addClass("active");
  $("#option_val").val(option);
}

function changeSongBasedOnOption() {
  const option = $("#option_val").val();
  if (option === "repeat") {
    $("#player")[0].currentTime = 0;
    $("#player")[0].play();
  } else {
    changeSong(Math.floor(Math.random() * songs.length));
  }
}

function handleOptionClick(ele) {
  const id = ele.target.id;
  if (id === "next") {
    changeSongBasedOnOption();
  } else {
    changeOption(id);
  }
}

function playAlreadySelectedSong() {
  const savedIndex = storage.get_index();
  changeSong(savedIndex);
  $("#already-selected-song").fadeOut();
}

function showAlreadyPlayingSongPopup() {
  const savedIndex = storage.get_index();
  $("#a-s-s-name").text(songs[savedIndex].original_name);
  $("#already-selected-song").fadeIn();
}

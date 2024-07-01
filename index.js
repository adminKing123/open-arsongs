const API_URI = "https://ionized-songs-book.glitch.me";
// const API_URI = "https://open-songs-api.onrender.com";

const API_ENDPOINTS = {
  status: () => `${API_URI}/status`,
  song: (path) => `${API_URI}/songs/${path}`,
  image: (path) => `${API_URI}/images/${path}`,
  list_songs: (query = "") => `${API_URI}/list/songs?query=${query}`,
  get_song: (index) => `${API_URI}/get/song/${index}`,
};

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

$(document).ready(function () {
  $("#list-songs-loader").hide();
  $("#list-songs-not-found").hide();
  $("#songs-lister").hide();

  const savedIndex = storage.get_index();

  $.ajax({
    url: API_ENDPOINTS.status(),
    method: "GET",
    dataType: "json",
    success: function (data) {
      total_songs = data.songs_length;
      if (savedIndex === null || savedIndex === undefined)
        $("#full-screen-loader").fadeOut();
    },
    error: function (err) {
      if (err?.status === 403) {
        $("#full-screen-loader-2").html(
          `
          <div style="text-align: center;">
            <p>You are not allowed to access this page.</p>
            <p><a style="color: green;" href="./addip.html">Please visit add IP</a></p>
          <div>
          `
        );
        $("#full-screen-loader-2").css("color", "red");
        $("#full-screen-loader-2").css("display", "flex");
      } else {
        console.log(err);
        alert("Some thing went wrong...");
      }
    },
  });

  const searchSongs = debounce((query) => {
    $("#list-songs-not-found").hide();
    $("#songs-lister").hide();
    $("#list-songs-loader").show();
    screen_rendered_songs = {};
    $.ajax({
      url: API_ENDPOINTS.list_songs(query),
      method: "GET",
      dataType: "json",
      success: function (data) {
        renderSongs(data.songs);

        data.songs.forEach((song) => {
          screen_rendered_songs[song.index] = song;
        });

        $("#list-songs-loader").hide();
        $("#list-songs-not-found").hide();
        $("#songs-lister").show();
      },
      error: function (err) {
        $("#list-songs-not-found").show();
        $("#songs-lister").hide();
        $("#list-songs-loader").hide();
      },
    });
  }, 200);

  $("#search-input").on("input", function () {
    const query = $(this).val();
    searchSongs(query);
  });

  initialize();

  if (savedIndex !== null && savedIndex !== undefined)
    showAlreadyPlayingSongPopup();

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

function changeSong(song, index) {
  storage.set_index(index);
  $("#player").attr("src", API_ENDPOINTS.song(song.url));
  $("#player")[0].play();

  $("#current-song-details").html(`
    <div class="cur-song-img">
        <img src="${API_ENDPOINTS.image(song.album.thumbnail)}" />
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
  if (storage.get_option() === null || storage.get_option() === undefined)
    storage.set_option(option);

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
    $("#next").addClass("loading");
    $.ajax({
      url: API_ENDPOINTS.get_song(Math.floor(Math.random() * total_songs)),
      method: "GET",
      dataType: "json",
      success: function (data) {
        let song = data.song;
        changeSong(song, song.index);
        $("#next").removeClass("loading");
      },
      error: function () {
        $("#next").removeClass("loading");
      },
    });
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
  changeSong(alreadySelectedSong, alreadySelectedSong.index);
  $("#already-selected-song").fadeOut();
}

function showAlreadyPlayingSongPopup() {
  const savedIndex = storage.get_index();

  $.ajax({
    url: API_ENDPOINTS.get_song(savedIndex),
    method: "GET",
    dataType: "json",
    success: function (data) {
      alreadySelectedSong = data.song;
      $("#full-screen-loader").fadeOut();
      $("#a-s-s-name").text(alreadySelectedSong.original_name);
      $("#already-selected-song").fadeIn();
    },
    error: function (err) {
      $("#full-screen-loader").fadeOut();
    },
  });
}

function initialize() {
  $("#list-songs-not-found").hide();
  $("#songs-lister").hide();
  $("#list-songs-loader").show();
  screen_rendered_songs = {};
  $.ajax({
    url: API_ENDPOINTS.list_songs(),
    method: "GET",
    dataType: "json",
    success: function (data) {
      renderSongs(data.songs);

      data.songs.forEach((song) => {
        screen_rendered_songs[song.index] = song;
      });

      $("#list-songs-loader").hide();
      $("#list-songs-not-found").hide();
      $("#songs-lister").show();
    },
    error: function (err) {
      $("#list-songs-not-found").show();
      $("#songs-lister").hide();
      $("#list-songs-loader").hide();
    },
  });
}

function renderSongs(songsToRender) {
  $("#songs-lister").empty();
  $.each(songsToRender, function (_, songObj) {
    const song = songObj;
    const li = $(
      `<li data-index=${songObj.index} onclick="setSong(${songObj.index})">`
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

function setSong(index) {
  const song = screen_rendered_songs[index];
  changeSong(song, index);
}

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

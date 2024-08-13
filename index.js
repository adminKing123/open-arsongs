// const API_URI = "http://localhost:3000";
let is_t_vis = localStorage.getItem("is_t_vis") === null ? false: localStorage.getItem("is_t_vis") === '0' ? false: true;
let is_a_vis = localStorage.getItem("is_a_vis") === null ? false: localStorage.getItem("is_a_vis") === '0' ? false: true;
let is_b_vis = localStorage.getItem("is_b_vis") === null ? false: localStorage.getItem("is_b_vis") === '0' ? false: true;
let is_l_vis = localStorage.getItem("is_l_vis") === null ? false: localStorage.getItem("is_l_vis") === '0' ? false: true;
let is_v_vis = localStorage.getItem("is_v_vis") === null ? false: localStorage.getItem("is_v_vis") === '0' ? false: true;
let is_t_cen = localStorage.getItem("is_t_cen") === null ? true: localStorage.getItem("is_t_cen") === '0' ? false: true;
const API_URI = "https://ionized-songs-book.glitch.me";
// const API_URI = "https://open-songs-api.onrender.com";

const API_ENDPOINTS = {
  status: () => `${API_URI}/status`,
  song: (path) => `${API_URI}/songs/${path}`,
  image: (path) => `${API_URI}/images/${path}`,
  lyrics: (path) => `${API_URI}/lyrics/${path}`,
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
  $("#player").prop("volume", .25);
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
  $("#hide-thumbnail").click(toggleShowT);
  $("#hide-a").click(toggleShowA);
  $("#hide-b").click(toggleShowB);
  $("#hide-l").click(toggleShowL);
  $("#hide-v").click(toggleShowV);
  $("#cen-t").click(toggleCenterT);

  $("#no-a-s-s").click(() => $("#already-selected-song").fadeOut());
  $("#play-a-s-s").click(playAlreadySelectedSong);

  toggleShowT();
  toggleShowA();
  toggleShowB();
  toggleShowL();
  toggleShowV();
  toggleCenterT();
});

const storage = {
  set_index: (index) => localStorage.setItem("index", index),
  get_index: () => localStorage.getItem("index"),
  set_option: (option) => localStorage.setItem("option", option),
  get_option: () => localStorage.getItem("option"),
};

function changeSong(song, index) {
  loadLyrics(song);
  storage.set_index(index);
  $("#player").attr("src", API_ENDPOINTS.song(song.url));
  $("#player")[0].play();

  $("#current-song-details").html(`
    <div>
      <div class="cur-song-img" title="ID: ${song.id}">
        <img src="${API_ENDPOINTS.image(song.album.thumbnail)}" />
      </div>
      <div class="cur-song-name">
      ${song.original_name}
      </div>
    </div>
  `);

  document.title = song.original_name;
}

function handleSongEnded() {
  $(".lyric-line").text("");
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

function toggleCenterT() {
  if (is_t_cen) {
    localStorage.setItem("is_t_cen", 1);
    $("#cen-t").addClass("active");
    
    $("#current-song-details").css("display", "");
    $("#current-song-details").css("justify-content", "");
    $("#current-song-details").css("align-items", "");
    $("#current-song-details").css("top", "28px");
    $("#current-song-details").css("right", "28px");
    $("#current-song-details").css("left", "");
    $("#current-song-details").css("width", "");
    $("#current-song-details").css("height", "");
    $("#current-song-details").css("pointer-events", "");
    
  } else {
    localStorage.setItem("is_t_cen", 0);
    $("#cen-t").removeClass("active");
    // center here
    $("#current-song-details").css("display", "flex");
    $("#current-song-details").css("justify-content", "center");
    $("#current-song-details").css("align-items", "center");
    $("#current-song-details").css("top", "0");
    $("#current-song-details").css("left", "0");
    $("#current-song-details").css("width", "100vw");
    $("#current-song-details").css("height", "100vh");
    $("#current-song-details").css("pointer-events", "none");
    
  }
  is_t_cen = !is_t_cen;
}

function toggleShowT() {
  if (is_t_vis) {
    localStorage.setItem("is_t_vis", 1);
    $("#hide-thumbnail").addClass("active");
    $("#current-song-details").hide()
  } else {
    localStorage.setItem("is_t_vis", 0);
    $("#hide-thumbnail").removeClass("active");
    $("#current-song-details").show()
  }
  is_t_vis = !is_t_vis;
}

function toggleShowA() {
  if (is_a_vis) {
    localStorage.setItem("is_a_vis", 1);
    $("#hide-a").addClass("active");
    $("#aaah").hide()
  } else {
    localStorage.setItem("is_a_vis", 0);
    $("#hide-a").removeClass("active");
    $("#aaah").show()
  }
  is_a_vis = !is_a_vis;
}

function toggleShowB() {
  if (is_b_vis) {
    localStorage.setItem("is_b_vis", 1);
    $("#hide-b").addClass("active");
    $("#lin-border").hide()
  } else {
    localStorage.setItem("is_b_vis", 0);
    $("#hide-b").removeClass("active");
    $("#lin-border").show()
  }
  is_b_vis = !is_b_vis;
}

function toggleShowL() {
  if (is_l_vis) {
    localStorage.setItem("is_l_vis", 1);
    $("#hide-l").addClass("active");
    $("#lyric-display").hide()
  } else {
    localStorage.setItem("is_l_vis", 0);
    $("#hide-l").removeClass("active");
    $("#lyric-display").show()
  }
  is_l_vis = !is_l_vis;
}

function toggleShowV() {
  if (is_v_vis) {
    localStorage.setItem("is_v_vis", 1);
    $("#hide-v").addClass("active");
    $("#visualizer-container").hide()
  } else {
    localStorage.setItem("is_v_vis", 0);
    $("#hide-v").removeClass("active");
    $("#visualizer-container").show()
  }
  is_v_vis = !is_v_vis;
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

const update = () => {
  const audio = document.getElementById("player");
  if (lyrics) {
    let currentLyricIndex = -1;
    const currentTime = audio.currentTime;

    let newIndex = currentLyricIndex;
    while (
      newIndex < lyrics.length - 1 &&
      lyrics[newIndex + 1].time <= currentTime
    ) {
      newIndex++;
    }

    if (newIndex !== currentLyricIndex) {
      currentLyricIndex = newIndex;
      displayLyrics(lyrics, currentLyricIndex);
    }
  }
};

document.getElementById("player").addEventListener("timeupdate", update);

function displayLyrics(lyrics, currentIndex) {
  const prevLine = document.getElementById("prev-line");
  const currentLine = document.getElementById("current-line");
  const nextLine = document.getElementById("next-line");

  prevLine.textContent = currentIndex > 0 ? lyrics[currentIndex - 1].text : "";
  currentLine.textContent = lyrics[currentIndex].text;
  nextLine.textContent =
    currentIndex < lyrics.length - 1 ? lyrics[currentIndex + 1].text : "";

  prevLine.className = "lyric-line adjacent";
  currentLine.className = "lyric-line current";
  nextLine.className = "lyric-line adjacent";
  void currentLine.offsetWidth;
}

function parseLrc(lrcContent) {
  const lines = lrcContent.split("\n");
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
  const lyrics = [];

  lines.forEach((line) => {
    const match = timeRegex.exec(line);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const milliseconds = parseInt(match[3]);
      const time = minutes * 60 + seconds + milliseconds / 1000;
      const text = line.replace(timeRegex, "").trim();
      lyrics.push({ time, text });
    }
  });

  return lyrics;
}

function loadLyrics(song) {
  $(".lyric-line").text("");
  lyrics = null;
  if (song.lyrics) {
    $.ajax({
      url: API_ENDPOINTS.lyrics(song.lyrics),
      method: "GET",
      success: function (data) {
        lyrics = parseLrc(data);
      },
      error: function (err) {
        console.log(err);
        lyrics = null;
        $(".lyric-line").text("");
      },
    });
  }
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

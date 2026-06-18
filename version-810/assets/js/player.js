import { H as Hls } from "./hls-lib.js";

export function setupMoviePlayer(playerId, sourceUrl) {
  var root = document.getElementById(playerId);
  if (!root) {
    return;
  }

  var video = root.querySelector("video");
  var poster = root.querySelector(".player-poster");
  var hls = null;
  var prepared = false;

  function prepare() {
    if (prepared || !video) {
      return;
    }
    prepared = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
  }

  function start() {
    prepare();
    root.classList.add("is-playing");
    video.setAttribute("controls", "controls");
    var action = video.play();
    if (action && typeof action.catch === "function") {
      action.catch(function () {
        root.classList.remove("is-playing");
      });
    }
  }

  if (poster) {
    poster.addEventListener("click", start);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (!prepared || video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      root.classList.add("is-playing");
    });
  }

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

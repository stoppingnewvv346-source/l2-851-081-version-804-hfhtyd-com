(function () {
  window.initMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var box = document.getElementById(options.triggerId);
    var overlay = box ? box.querySelector(options.overlaySelector) : null;
    if (!video || !box || !options.source) {
      return;
    }
    var hls = null;
    var ready = false;
    var attach = function () {
      if (ready) {
        return;
      }
      ready = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(options.source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else {
        video.src = options.source;
      }
    };
    var start = function () {
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var play = video.play();
      if (play && typeof play.catch === 'function') {
        play.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    };
    if (options.poster) {
      video.poster = options.poster;
    }
    attach();
    if (overlay) {
      overlay.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }
    box.addEventListener('click', function (event) {
      if (event.target !== video) {
        start();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
  };
}());

(function () {
  function setupPlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.player-start');
    var stream = shell.getAttribute('data-stream');
    var ready = false;
    var hls = null;

    function playVideo() {
      if (button) button.classList.add('is-hidden');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    function attach(playAfterReady) {
      if (ready) {
        if (playAfterReady) playVideo();
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.addEventListener('loadedmetadata', function () {
          if (playAfterReady) playVideo();
        }, { once: true });
        if (playAfterReady) playVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (playAfterReady) playVideo();
        });
        return;
      }
      video.src = stream;
      if (playAfterReady) playVideo();
    }

    if (!video || !stream) return;
    if (button) {
      button.addEventListener('click', function () {
        attach(true);
      });
    }
    video.addEventListener('click', function () {
      if (!ready || video.paused) attach(true);
    });
    video.addEventListener('play', function () {
      if (button) button.classList.add('is-hidden');
    });
    window.addEventListener('beforeunload', function () {
      if (hls) hls.destroy();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(setupPlayer);
  });
})();

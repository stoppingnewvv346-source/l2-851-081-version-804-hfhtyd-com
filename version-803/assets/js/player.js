function initStreamPlayer(videoId, buttonId, url) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var hlsInstance = null;

    if (!video || !button || !url) {
        return;
    }

    function attach() {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (video.src !== url) {
                video.src = url;
            }
            return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (!hlsInstance) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
            }
            return Promise.resolve();
        }

        video.src = url;
        return Promise.resolve();
    }

    function play() {
        attach().then(function () {
            button.classList.add('is-hidden');
            var started = video.play();
            if (started && typeof started.catch === 'function') {
                started.catch(function () {
                    button.classList.remove('is-hidden');
                });
            }
        });
    }

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });
    video.addEventListener('play', function () {
        button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
        if (!video.ended) {
            button.classList.remove('is-hidden');
        }
    });
    attach();
}

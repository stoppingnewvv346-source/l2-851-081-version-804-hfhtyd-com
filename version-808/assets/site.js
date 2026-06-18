(function () {
  var header = document.querySelector("[data-header]");
  var toggle = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  if (header) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 12) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }, { passive: true });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        startTimer();
      });
    });

    hero.addEventListener("mouseenter", stopTimer);
    hero.addEventListener("mouseleave", startTimer);
    showSlide(0);
    startTimer();
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  var filterPanels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

  filterPanels.forEach(function (panel) {
    var root = panel.parentElement || document;
    var input = panel.querySelector("[data-search-input]");
    var selects = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-field]"));
    var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));
    var empty = root.querySelector("[data-empty-state]");

    function applyFilters() {
      var query = normalize(input ? input.value : "");
      var filters = {};

      selects.forEach(function (select) {
        filters[select.getAttribute("data-filter-field")] = normalize(select.value);
      });

      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));

        var pass = true;

        if (query && haystack.indexOf(query) === -1) {
          pass = false;
        }

        Object.keys(filters).forEach(function (key) {
          var filterValue = filters[key];
          var cardValue = normalize(card.getAttribute("data-" + key));

          if (filterValue && cardValue.indexOf(filterValue) === -1) {
            pass = false;
          }
        });

        card.hidden = !pass;

        if (pass) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", applyFilters);
    }

    selects.forEach(function (select) {
      select.addEventListener("change", applyFilters);
    });

    applyFilters();
  });

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      var status = player.querySelector("[data-player-status]");
      var source = player.getAttribute("data-video-url");
      var initialized = false;
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function initPlayer() {
        if (initialized) {
          return Promise.resolve();
        }

        initialized = true;
        setStatus("正在加载播放源...");

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);

          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus("播放源已就绪");
          });

          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("播放加载遇到异常，请刷新后重试");
              try {
                hlsInstance.destroy();
              } catch (error) {
                hlsInstance = null;
              }
              initialized = false;
            }
          });

          return Promise.resolve();
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          setStatus("播放源已就绪");
          return Promise.resolve();
        }

        video.src = source;
        setStatus("正在尝试使用浏览器原生播放器");
        return Promise.resolve();
      }

      function playVideo() {
        initPlayer().then(function () {
          if (button) {
            button.classList.add("hidden");
          }

          var playPromise = video.play();

          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
              if (button) {
                button.classList.remove("hidden");
              }

              setStatus("点击播放按钮开始观看");
            });
          }
        });
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          playVideo();
        });
      }

      player.addEventListener("click", function (event) {
        if (event.target === video) {
          return;
        }

        playVideo();
      });

      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("hidden");
        }
        setStatus("正在播放");
      });

      video.addEventListener("pause", function () {
        setStatus("已暂停");
      });

      video.addEventListener("ended", function () {
        if (button) {
          button.classList.remove("hidden");
        }
        setStatus("播放结束");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupPlayers);
  } else {
    setupPlayers();
  }
})();

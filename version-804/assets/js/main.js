(function () {
  var body = document.body;
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
      body.classList.toggle('menu-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === activeIndex);
      });
    }

    function startHero() {
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5000);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(dotIndex);
        startHero();
      });
    });

    if (slides.length > 1) {
      startHero();
    }
  }

  var backTop = document.querySelector('[data-back-top]');

  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.classList.toggle('visible', window.scrollY > 520);
    }, { passive: true });

    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var searchInput = document.querySelector('[data-search-input]');
  var categoryFilter = document.querySelector('[data-category-filter]');
  var cardGrid = document.querySelector('[data-card-grid]');
  var cards = cardGrid ? Array.prototype.slice.call(cardGrid.querySelectorAll('[data-movie-card]')) : [];
  var noResults = null;

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function ensureNoResults() {
    if (!cardGrid) {
      return null;
    }
    if (!noResults) {
      noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.textContent = '没有找到匹配的影片';
      cardGrid.appendChild(noResults);
    }
    return noResults;
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var query = normalize(searchInput ? searchInput.value : '');
    var category = categoryFilter ? categoryFilter.value : '';
    var visibleCount = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-year'),
        card.getAttribute('data-category')
      ].join(' '));
      var matchQuery = !query || haystack.indexOf(query) !== -1;
      var matchCategory = !category || card.getAttribute('data-category') === category;
      var visible = matchQuery && matchCategory;
      card.style.display = visible ? '' : 'none';
      if (visible) {
        visibleCount += 1;
      }
    });

    var empty = ensureNoResults();
    if (empty) {
      empty.style.display = visibleCount ? 'none' : 'block';
    }
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (initialQuery) {
      searchInput.value = initialQuery;
    }
    searchInput.addEventListener('input', applyFilters);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', applyFilters);
  }

  applyFilters();

  var video = document.querySelector('[data-hls-video]');
  var playButton = document.querySelector('[data-play-button]');
  var shell = document.querySelector('[data-player-shell]');
  var hlsInstance = null;
  var sourceAttached = false;

  function attachSource() {
    if (!video || sourceAttached) {
      return;
    }

    var source = video.getAttribute('data-src');

    if (!source) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      video.src = source;
    }

    sourceAttached = true;
  }

  function playVideo() {
    if (!video) {
      return;
    }

    attachSource();
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (video) {
    attachSource();

    video.addEventListener('play', function () {
      if (shell) {
        shell.classList.add('is-playing');
      }
    });

    video.addEventListener('pause', function () {
      if (shell) {
        shell.classList.remove('is-playing');
      }
    });

    video.addEventListener('ended', function () {
      if (shell) {
        shell.classList.remove('is-playing');
      }
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });
  }

  if (playButton) {
    playButton.addEventListener('click', playVideo);
  }

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
})();

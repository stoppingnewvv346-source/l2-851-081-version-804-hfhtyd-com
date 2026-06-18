(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupHero() {
    var hero = $('.hero');
    if (!hero) return;
    var slides = $all('.hero-slide', hero);
    var dots = $all('.hero-dot', hero);
    var prev = $('.hero-prev', hero);
    var next = $('.hero-next', hero);
    if (!slides.length) return;
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var panels = $all('.filter-panel');
    panels.forEach(function (panel) {
      var section = panel.parentElement || document;
      var cards = $all('.movie-card, .rank-item', section);
      var textInput = $('.movie-filter-input', panel);
      var yearSelect = $('.movie-filter-year', panel);
      var regionInput = $('.movie-filter-region', panel);
      var empty = $('.empty-state', section);

      function apply() {
        var text = (textInput && textInput.value || '').trim().toLowerCase();
        var year = (yearSelect && yearSelect.value || '').trim();
        var region = (regionInput && regionInput.value || '').trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var value = [card.dataset.title, card.dataset.genre, card.dataset.year, card.dataset.region].join(' ').toLowerCase();
          var matchText = !text || value.indexOf(text) > -1;
          var matchYear = !year || card.dataset.year === year;
          var matchRegion = !region || (card.dataset.region || '').toLowerCase().indexOf(region) > -1;
          var show = matchText && matchYear && matchRegion;
          card.classList.toggle('hidden-by-filter', !show);
          if (show) visible += 1;
        });
        if (empty) empty.classList.toggle('is-visible', visible === 0);
      }

      [textInput, yearSelect, regionInput].forEach(function (control) {
        if (control) control.addEventListener('input', apply);
        if (control) control.addEventListener('change', apply);
      });
      apply();
    });
  }

  function setupSearchPage() {
    var mount = $('#search-results');
    if (!mount || !window.SEARCH_INDEX) return;
    var input = $('#search-input');
    var form = $('#search-form');
    var hint = $('#search-hint');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input) input.value = query;

    function card(item) {
      var tags = (item.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return [
        '<article class="movie-card" data-title="' + escapeAttr(item.title) + '" data-genre="' + escapeAttr(item.genre) + '" data-year="' + escapeAttr(item.year) + '" data-region="' + escapeAttr(item.region) + '">',
        '<a class="movie-card__cover" href="./' + escapeAttr(item.url) + '">',
        '<img src="' + escapeAttr(item.cover) + '" alt="' + escapeAttr(item.title) + '" loading="lazy">',
        '<span class="movie-card__play">▶</span>',
        '</a>',
        '<div class="movie-card__body">',
        '<div class="movie-card__meta">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</div>',
        '<h3><a href="./' + escapeAttr(item.url) + '">' + escapeHtml(item.title) + '</a></h3>',
        '<p>' + escapeHtml(item.desc) + '</p>',
        '<div class="tag-row">' + tags + '</div>',
        '</div>',
        '</article>'
      ].join('');
    }

    function render(q) {
      var needle = q.trim().toLowerCase();
      var results = window.SEARCH_INDEX.filter(function (item) {
        if (!needle) return item.rank < 80;
        var value = [item.title, item.genre, item.region, item.year, item.type, (item.tags || []).join(' ')].join(' ').toLowerCase();
        return value.indexOf(needle) > -1;
      }).slice(0, 120);
      mount.innerHTML = results.map(card).join('');
      if (hint) hint.textContent = needle ? '匹配到的影片如下' : '输入片名、类型、地区或年份查找影片';
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var q = input ? input.value : '';
        var url = new URL(window.location.href);
        url.searchParams.set('q', q);
        history.replaceState(null, '', url.toString());
        render(q);
      });
    }
    if (input) input.addEventListener('input', function () { render(input.value); });
    render(query);
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char];
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();

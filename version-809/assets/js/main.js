(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));
  var panel = document.querySelector('[data-search-panel]');
  var closeButton = document.querySelector('[data-search-close]');
  var resultBox = document.querySelector('[data-search-results]');
  var searchIndex = window.SEARCH_INDEX || [];
  var openResults = function (query) {
    if (!panel || !resultBox) {
      return;
    }
    var keyword = (query || '').trim().toLowerCase();
    var matches = searchIndex.filter(function (item) {
      var text = [item.title, item.year, item.region, item.category, item.genre, item.summary].join(' ').toLowerCase();
      return keyword && text.indexOf(keyword) !== -1;
    }).slice(0, 24);
    resultBox.innerHTML = matches.length ? matches.map(function (item) {
      return '<a class="search-result-item" href="' + item.url + '">' +
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" onerror="this.style.opacity=\'0\';">' +
        '<div><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.category) + '</span><p>' + escapeHtml(item.summary) + '</p></div>' +
        '</a>';
    }).join('') : '<div class="search-result-item"><div></div><div><strong>没有找到匹配影片</strong><p>可以尝试输入片名、年份、地区或类型关键词。</p></div></div>';
    panel.classList.add('is-open');
  };
  var escapeHtml = function (text) {
    return String(text).replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  };
  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      openResults(input ? input.value : '');
    });
  });
  if (closeButton && panel) {
    closeButton.addEventListener('click', function () {
      panel.classList.remove('is-open');
    });
    panel.addEventListener('click', function (event) {
      if (event.target === panel) {
        panel.classList.remove('is-open');
      }
    });
  }

  var filterRoots = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]'));
  filterRoots.forEach(function (root) {
    var active = {};
    var buttons = Array.prototype.slice.call(root.querySelectorAll('[data-filter-group]'));
    var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
    var apply = function () {
      cards.forEach(function (card) {
        var visible = Object.keys(active).every(function (key) {
          return active[key] === 'all' || card.getAttribute('data-' + key) === active[key];
        });
        card.style.display = visible ? '' : 'none';
      });
    };
    buttons.forEach(function (button) {
      var group = button.getAttribute('data-filter-group');
      if (!active[group]) {
        active[group] = 'all';
      }
      button.addEventListener('click', function () {
        active[group] = button.getAttribute('data-filter-value');
        buttons.filter(function (item) {
          return item.getAttribute('data-filter-group') === group;
        }).forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        apply();
      });
    });
  });
}());

import { H as Hls } from './hls.js';

const header = document.querySelector('[data-site-header]');
const menuButton = document.querySelector('[data-menu-toggle]');
const mobileMenu = document.querySelector('[data-mobile-menu]');

function updateHeader() {
  if (!header) {
    return;
  }
  header.classList.toggle('is-scrolled', window.scrollY > 32);
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

if (menuButton && mobileMenu) {
  menuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('is-open');
  });
}

document.querySelectorAll('[data-search-form]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    const input = form.querySelector('input[name="q"]');
    const query = input ? input.value.trim() : '';
    if (!query) {
      event.preventDefault();
      window.location.href = 'movies.html';
      return;
    }
    event.preventDefault();
    window.location.href = `movies.html?q=${encodeURIComponent(query)}`;
  });
});

document.querySelectorAll('[data-cover-image]').forEach((image) => {
  image.addEventListener('error', () => {
    const frame = image.closest('.poster-frame, .hero-art, .rank-thumb, .detail-backdrop');
    if (frame) {
      frame.classList.add('is-missing');
    }
    image.style.opacity = '0';
  });
});

function setupHero() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) {
    return;
  }
  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  if (slides.length <= 1) {
    return;
  }
  let active = 0;
  let timer = null;
  const activate = (index) => {
    active = index;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === active);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === active);
    });
  };
  const next = () => activate((active + 1) % slides.length);
  const start = () => {
    timer = window.setInterval(next, 5200);
  };
  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      stop();
      activate(index);
      start();
    });
  });
  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  start();
}

function setupFiltering() {
  const list = document.querySelector('[data-filterable-list]');
  if (!list) {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const query = (params.get('q') || '').trim().toLowerCase();
  const cards = Array.from(list.querySelectorAll('[data-movie-card]'));
  const countNode = document.querySelector('[data-visible-count]');
  const emptyNode = document.querySelector('[data-empty-state]');
  document.querySelectorAll('input[name="q"]').forEach((input) => {
    input.value = query;
  });
  if (!query) {
    if (countNode) {
      countNode.textContent = String(cards.length);
    }
    return;
  }
  let visible = 0;
  cards.forEach((card) => {
    const haystack = [
      card.dataset.title,
      card.dataset.tags,
      card.dataset.region,
      card.dataset.type,
      card.dataset.year
    ].join(' ').toLowerCase();
    const matched = haystack.includes(query);
    card.style.display = matched ? '' : 'none';
    if (matched) {
      visible += 1;
    }
  });
  if (countNode) {
    countNode.textContent = String(visible);
  }
  if (emptyNode) {
    emptyNode.classList.toggle('is-visible', visible === 0);
  }
}

function setupPlayer() {
  const video = document.querySelector('video[data-hls-src]');
  if (!video) {
    return;
  }
  const source = video.dataset.hlsSrc;
  if (!source) {
    return;
  }
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    return;
  }
  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data && data.fatal) {
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      }
    });
  }
}

setupHero();
setupFiltering();
setupPlayer();

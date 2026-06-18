(function () {
  const mobileButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  if (mobileButton && mobileMenu) {
    mobileButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  const slider = document.querySelector("[data-hero-slider]");
  if (slider) {
    const slides = Array.from(slider.querySelectorAll(".hero-slide"));
    const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
    let current = 0;
    const show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        show(current + 1);
      }, 5600);
    }
  }

  document.querySelectorAll("[data-search-form]").forEach(function (form) {
    const section = form.closest("section") || document;
    const cards = Array.from(section.querySelectorAll("[data-search-card]"));
    const input = form.querySelector("[data-search-input]");
    const typeSelect = form.querySelector("[data-type-filter]");
    const regionSelect = form.querySelector("[data-region-filter]");
    const apply = function () {
      const keyword = input ? input.value.trim().toLowerCase() : "";
      const type = typeSelect ? typeSelect.value : "";
      const region = regionSelect ? regionSelect.value : "";
      cards.forEach(function (card) {
        const haystack = (card.dataset.keywords || "").toLowerCase();
        const matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        const matchType = !type || haystack.indexOf(type.toLowerCase()) !== -1;
        const matchRegion = !region || haystack.indexOf(region.toLowerCase()) !== -1;
        card.classList.toggle("is-hidden", !(matchKeyword && matchType && matchRegion));
      });
    };
    form.addEventListener("input", apply);
    form.addEventListener("change", apply);
    form.addEventListener("reset", function () {
      setTimeout(apply, 0);
    });
  });
})();

function initMoviePlayer(streamUrl) {
  const video = document.getElementById("videoPlayer");
  const overlay = document.getElementById("playOverlay");
  if (!video || !overlay || !streamUrl) {
    return;
  }
  let hlsInstance = null;
  const attach = function () {
    if (video.dataset.ready === "1") {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
    video.dataset.ready = "1";
  };
  const start = function () {
    attach();
    overlay.classList.add("is-hidden");
    const playTask = video.play();
    if (playTask && typeof playTask.catch === "function") {
      playTask.catch(function () {
        overlay.classList.remove("is-hidden");
      });
    }
  };
  overlay.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener("play", function () {
    overlay.classList.add("is-hidden");
  });
  video.addEventListener("pause", function () {
    if (!video.ended) {
      overlay.classList.remove("is-hidden");
    }
  });
  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

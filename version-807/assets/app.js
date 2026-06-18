(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = panel.hasAttribute("hidden");
            if (open) {
                panel.removeAttribute("hidden");
                toggle.setAttribute("aria-expanded", "true");
                toggle.textContent = "×";
            } else {
                panel.setAttribute("hidden", "");
                toggle.setAttribute("aria-expanded", "false");
                toggle.textContent = "☰";
            }
        });
    }

    function setupImageFallback() {
        var images = document.querySelectorAll(".cover-frame img, .hero-media img");
        images.forEach(function (img) {
            img.addEventListener("error", function () {
                var holder = img.closest(".cover-frame") || img.closest(".hero-media");
                if (holder) {
                    holder.classList.add("is-missing");
                }
            }, { once: true });
        });
    }

    function setupCarousel() {
        var carousel = document.querySelector("[data-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        var prev = carousel.querySelector(".hero-prev");
        var next = carousel.querySelector(".hero-next");
        var current = 0;
        var timer;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide")) || 0);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupPlayers() {
        var videos = document.querySelectorAll("video.js-player[data-src]");
        videos.forEach(function (video) {
            var source = video.getAttribute("data-src");
            if (!source) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
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
                video.src = source;
            }
        });
    }

    function createCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "" +
            "<article class=\"movie-card\">" +
                "<a class=\"cover-frame\" href=\"" + escapeAttr(movie.url) + "\" data-title=\"" + escapeAttr(movie.title) + "\">" +
                    "<img src=\"" + escapeAttr(movie.cover) + "\" alt=\"" + escapeAttr(movie.title) + "\" loading=\"lazy\">" +
                    "<span class=\"cover-badge\">" + escapeHtml(movie.region || movie.type || "精选") + "</span>" +
                "</a>" +
                "<div class=\"card-body\">" +
                    "<div class=\"card-meta\"><span>" + escapeHtml(movie.year || "精选") + "</span><span>" + escapeHtml(movie.type || "影视") + "</span></div>" +
                    "<h3><a href=\"" + escapeAttr(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
                    "<p>" + escapeHtml(movie.oneLine || "") + "</p>" +
                    "<div class=\"tag-row\">" + tags + "</div>" +
                "</div>" +
            "</article>";
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function escapeAttr(value) {
        return escapeHtml(value);
    }

    function setupSearchPage() {
        var target = document.getElementById("search-results");
        if (!target || !window.MOVIE_INDEX) {
            return;
        }
        var input = document.getElementById("page-search-input");
        var title = document.getElementById("search-title");
        var summary = document.getElementById("search-summary");
        var params = new URLSearchParams(window.location.search);
        var q = (params.get("q") || "").trim();
        if (input) {
            input.value = q;
        }
        var list = window.MOVIE_INDEX;
        if (q) {
            var keyword = q.toLowerCase();
            list = list.filter(function (movie) {
                return [
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.oneLine,
                    (movie.tags || []).join(" ")
                ].join(" ").toLowerCase().indexOf(keyword) !== -1;
            });
        } else {
            list = list.slice(0, 48);
        }
        if (title) {
            title.textContent = q ? "搜索结果" : "精选片单";
        }
        if (summary) {
            summary.textContent = q ? "关键词“" + q + "”共找到 " + list.length + " 部影片。" : "默认展示 48 部精选影片，也可以使用上方搜索框筛选。";
        }
        target.innerHTML = list.slice(0, 240).map(createCard).join("");
        setupImageFallback();
    }

    ready(function () {
        setupMenu();
        setupImageFallback();
        setupCarousel();
        setupPlayers();
        setupSearchPage();
    });
})();

(function () {
  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector("#siteNav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupCategoryFilter() {
    var shell = document.querySelector("[data-category-filter]");
    if (!shell) {
      return;
    }
    var input = shell.querySelector("[data-category-search]");
    var buttons = Array.prototype.slice.call(shell.querySelectorAll("[data-filter-value]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));
    var active = "all";

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesPill = active === "all" || text.indexOf(active.toLowerCase()) !== -1;
        card.style.display = matchesQuery && matchesPill ? "" : "none";
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        active = button.getAttribute("data-filter-value") || "all";
        applyFilter();
      });
    });
  }

  function setupSearchPage() {
    var form = document.querySelector("[data-search-form]");
    var results = document.querySelector("[data-search-results]");
    var count = document.querySelector("[data-search-count]");
    if (!form || !results || !window.MOVIE_SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var queryInput = form.querySelector("[name='q']");
    var regionSelect = form.querySelector("[name='region']");
    var typeSelect = form.querySelector("[name='type']");
    var yearSelect = form.querySelector("[name='year']");

    if (queryInput && params.get("q")) {
      queryInput.value = params.get("q");
    }

    function card(movie) {
      return [
        '<a class="movie-card" href="' + escapeHtml(movie.url) + '" data-search="' + escapeHtml(movie.search) + '">',
        '  <span class="poster-frame">',
        '    <img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="poster-shade"></span>',
        '    <span class="watch-chip">播放</span>',
        '  </span>',
        '  <span class="movie-info">',
        '    <strong>' + escapeHtml(movie.title) + '</strong>',
        '    <em>' + escapeHtml(movie.region + ' · ' + movie.type + ' · ' + movie.year) + '</em>',
        '    <span class="line-clamp">' + escapeHtml(movie.oneLine) + '</span>',
        '  </span>',
        '</a>'
      ].join("\n");
    }

    function render() {
      var query = queryInput ? queryInput.value.trim().toLowerCase() : "";
      var region = regionSelect ? regionSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var year = yearSelect ? yearSelect.value : "";
      var matches = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        var text = String(movie.search || "").toLowerCase();
        var queryOk = !query || text.indexOf(query) !== -1;
        var regionOk = !region || movie.region === region;
        var typeOk = !type || movie.type === type;
        var yearOk = !year || movie.year === year;
        return queryOk && regionOk && typeOk && yearOk;
      });
      var visible = matches.slice(0, 240);
      results.innerHTML = visible.length
        ? visible.map(card).join("\n")
        : '<div class="empty-state">没有找到匹配的影片</div>';
      if (count) {
        count.textContent = '找到 ' + matches.length + ' 部影片';
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
    });

    Array.prototype.slice.call(form.querySelectorAll("input, select")).forEach(function (field) {
      field.addEventListener("input", render);
      field.addEventListener("change", render);
    });

    render();
  }

  window.initMoviePlayer = function (source) {
    onReady(function () {
      var video = document.querySelector("#movie-player");
      var cover = document.querySelector("#player-cover");
      var hls = null;
      var loaded = false;

      function load() {
        if (!video || !source || loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function play() {
        load();
        if (cover) {
          cover.classList.add("is-hidden");
        }
        var promise = video && video.play ? video.play() : null;
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", play);
      }

      if (video) {
        video.addEventListener("play", function () {
          if (cover) {
            cover.classList.add("is-hidden");
          }
        });
        video.addEventListener("click", function () {
          if (!loaded) {
            play();
          }
        });
      }

      window.addEventListener("pagehide", function () {
        if (hls && hls.destroy) {
          hls.destroy();
        }
      });
    });
  };

  onReady(function () {
    setupMenu();
    setupHero();
    setupCategoryFilter();
    setupSearchPage();
  });
})();

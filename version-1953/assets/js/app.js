(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setSearchForms() {
    qsa('.js-site-search').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = qs('input[name="q"]', form);
        var query = input ? input.value.trim() : '';
        if (query) {
          window.location.href = './search.html?q=' + encodeURIComponent(query);
        }
      });
    });
  }

  function setMobileMenu() {
    var button = qs('.menu-toggle');
    var panel = qs('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setHeroSlider() {
    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    show(0);
    start();
  }

  function setCategoryFilter() {
    var area = qs('[data-filter-area]');
    if (!area) {
      return;
    }
    var input = qs('[data-filter-search]', area);
    var year = qs('[data-filter-year]', area);
    var region = qs('[data-filter-region]', area);
    var cards = qsa('[data-card]');
    var empty = qs('[data-empty-state]');

    function normalize(value) {
      return String(value || '').toLowerCase();
    }

    function apply() {
      var term = normalize(input && input.value);
      var yearValue = year ? year.value : '';
      var regionValue = region ? region.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year')
        ].join(' '));
        var ok = true;
        if (term && haystack.indexOf(term) === -1) {
          ok = false;
        }
        if (yearValue && card.getAttribute('data-year') !== yearValue) {
          ok = false;
        }
        if (regionValue && card.getAttribute('data-region') !== regionValue) {
          ok = false;
        }
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    [input, year, region].forEach(function (el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });
  }

  function makeCard(movie) {
    var title = escapeHtml(movie.title);
    var firstGenre = escapeHtml(String(movie.genre || '').split(/[\/／、,，|]+/)[0] || movie.genre || '精选');
    return [
      '<a class="movie-card" href="' + movie.url + '">',
      '<span class="poster-wrap">',
      '<img src="' + movie.cover + '" alt="' + title + '" loading="lazy">',
      '<span class="poster-shade"></span>',
      '<span class="poster-play">▶</span>',
      '<span class="card-badge">' + firstGenre + '</span>',
      '<span class="card-year">' + escapeHtml(movie.year) + '</span>',
      '</span>',
      '<span class="movie-info">',
      '<strong>' + title + '</strong>',
      '<em>' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</em>',
      '<span class="line-clamp">' + escapeHtml(movie.oneLine) + '</span>',
      '</span>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function setSearchPage() {
    var results = qs('#search-results');
    if (!results || !window.MOVIES) {
      return;
    }
    var form = qs('.js-search-page-form');
    var input = qs('input[name="q"]', form);
    var meta = qs('[data-search-meta]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }

    function render(query) {
      var term = String(query || '').trim().toLowerCase();
      if (!term) {
        results.innerHTML = '';
        if (meta) {
          meta.textContent = '请输入关键词开始搜索。';
        }
        return;
      }
      var matched = window.MOVIES.filter(function (movie) {
        return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine]
          .join(' ')
          .toLowerCase()
          .indexOf(term) !== -1;
      }).slice(0, 120);
      results.innerHTML = matched.map(makeCard).join('');
      if (meta) {
        meta.textContent = matched.length ? '已为你找到相关影片。' : '没有找到匹配的影片。';
      }
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = input ? input.value.trim() : '';
        var nextUrl = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
        window.history.replaceState(null, '', nextUrl);
        render(query);
      });
    }
    render(initial);
  }

  function setPlayer() {
    var holder = qs('[data-player]');
    if (!holder || !window.playUrl) {
      return;
    }
    var video = qs('video', holder);
    var overlay = qs('.play-overlay', holder);
    var attached = false;
    var hlsInstance = null;

    function attachMedia() {
      if (attached || !video) {
        return;
      }
      attached = true;
      var mediaUrl = window.playUrl;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = mediaUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(mediaUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (video.getAttribute('data-ready-play') === 'yes') {
            requestPlay();
          }
        });
      } else {
        video.src = mediaUrl;
      }
    }

    function requestPlay() {
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    function play() {
      video.setAttribute('data-ready-play', 'yes');
      attachMedia();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
      requestPlay();
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setSearchForms();
    setMobileMenu();
    setHeroSlider();
    setCategoryFilter();
    setSearchPage();
    setPlayer();
  });
})();

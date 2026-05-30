(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function movieMatches(movie, query) {
    var text = [
      movie.title,
      movie.year,
      movie.region,
      movie.type,
      movie.genre,
      movie.category,
      movie.oneLine,
      movie.tags
    ].join(' ').toLowerCase();
    return text.indexOf(query) !== -1;
  }

  function makeResultCard(movie) {
    return '' +
      '<article class="movie-card">' +
        '<a class="poster-link" href="' + movie.url + '">' +
          '<img src="' + movie.image + '" alt="' + movie.title + '封面" loading="lazy">' +
          '<span class="poster-overlay"><span>播放</span></span>' +
          '<span class="genre-badge">' + movie.category + '</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
          '<h3><a href="' + movie.url + '">' + movie.title + '</a></h3>' +
          '<p>' + movie.oneLine + '</p>' +
          '<div class="movie-meta"><span>' + movie.year + '</span><span>' + movie.region + '</span></div>' +
        '</div>' +
      '</article>';
  }

  function initMobileMenu() {
    var button = document.querySelector('.js-mobile-menu');
    var panel = document.querySelector('.js-mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('.js-hero');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function play() {
      if (slides.length <= 1) {
        return;
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-slide') || 0));
        play();
      });
    });

    show(0);
    play();
  }

  function initSearchSuggest() {
    var input = document.querySelector('.js-search-input');
    var box = document.querySelector('.js-search-suggest');
    var data = window.MOVIE_SEARCH_DATA || [];
    if (!input || !box || !data.length) {
      return;
    }

    function closeSuggest() {
      box.classList.remove('open');
      box.innerHTML = '';
    }

    input.addEventListener('input', function () {
      var query = normalize(input.value);
      if (!query) {
        closeSuggest();
        return;
      }
      var results = data.filter(function (movie) {
        return movieMatches(movie, query);
      }).slice(0, 6);

      if (!results.length) {
        closeSuggest();
        return;
      }

      box.innerHTML = results.map(function (movie) {
        return '' +
          '<a href="' + movie.url + '">' +
            '<img src="' + movie.image + '" alt="' + movie.title + '封面" loading="lazy">' +
            '<span><b>' + movie.title + '</b><small>' + movie.year + ' · ' + movie.region + ' · ' + movie.category + '</small></span>' +
          '</a>';
      }).join('');
      box.classList.add('open');
    });

    document.addEventListener('click', function (event) {
      if (!box.contains(event.target) && event.target !== input) {
        closeSuggest();
      }
    });
  }

  function initSearchPage() {
    var form = document.querySelector('.js-search-page-form');
    var input = document.querySelector('#search-page-input');
    var summary = document.querySelector('.js-search-summary');
    var results = document.querySelector('.js-search-results');
    var data = window.MOVIE_SEARCH_DATA || [];
    if (!form || !input || !summary || !results) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get('q') || '';
    input.value = queryFromUrl;

    function render(query) {
      var normalized = normalize(query);
      if (!normalized) {
        summary.textContent = '请输入关键词开始搜索。';
        results.innerHTML = '';
        return;
      }
      var found = data.filter(function (movie) {
        return movieMatches(movie, normalized);
      });
      summary.textContent = '关键词“' + query + '”共找到 ' + found.length + ' 部影片。';
      results.innerHTML = found.slice(0, 240).map(makeResultCard).join('');
      if (found.length > 240) {
        summary.textContent += ' 当前显示前 240 部，可继续输入更精确的关键词。';
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
      window.history.replaceState(null, '', url);
      render(query);
    });

    render(queryFromUrl);
  }

  function initLocalFilter() {
    var input = document.querySelector('.js-local-filter');
    if (!input) {
      return;
    }
    var selector = input.getAttribute('data-target');
    var cards = Array.prototype.slice.call(document.querySelectorAll(selector));
    input.addEventListener('input', function () {
      var query = normalize(input.value);
      cards.forEach(function (card) {
        var matched = normalize(card.textContent).indexOf(query) !== -1;
        card.classList.toggle('hidden-by-filter', !matched);
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initSearchSuggest();
    initSearchPage();
    initLocalFilter();
  });
}());

(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startTimer() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    function restartTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      startTimer();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restartTimer();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        restartTimer();
      });
    });

    startTimer();
  }

  var filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    var input = filterPanel.querySelector('[data-filter-input]');
    var yearSelect = filterPanel.querySelector('[data-year-filter]');
    var typeButtons = Array.prototype.slice.call(filterPanel.querySelectorAll('[data-type-filter]'));
    var grid = document.querySelector('[data-filter-grid]');
    var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('.movie-card')) : [];
    var selectedType = 'all';

    function normalize(value) {
      return (value || '').toString().toLowerCase().trim();
    }

    function applyFilters() {
      var query = normalize(input ? input.value : '');
      var selectedYear = yearSelect ? yearSelect.value : 'all';

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var cardType = card.getAttribute('data-type') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchType = selectedType === 'all' || cardType === selectedType;
        var matchYear = selectedYear === 'all' || cardYear === selectedYear;
        card.classList.toggle('hidden-card', !(matchQuery && matchType && matchYear));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilters);
    }

    typeButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        selectedType = button.getAttribute('data-type-filter') || 'all';
        typeButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        applyFilters();
      });
    });
  }

  var searchResults = document.querySelector('[data-search-results]');

  if (searchResults && window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim();
    var summary = document.querySelector('[data-search-summary]');
    var inputBox = document.querySelector('.big-search input[name="q"]');

    if (inputBox) {
      inputBox.value = q;
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    }

    function renderCard(movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '<article class="movie-card">' +
        '<a class="poster-link" href="./' + escapeHtml(movie.file) + '" aria-label="' + escapeHtml(movie.title) + '">' +
          '<div class="movie-poster" style="background-image: url(\'./' + escapeHtml(movie.cover) + '.jpg\');">' +
            '<span class="poster-badge">' + escapeHtml(movie.region) + '</span>' +
            '<span class="poster-play">播放</span>' +
          '</div>' +
        '</a>' +
        '<div class="movie-card-body">' +
          '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
          '<h2><a href="./' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h2>' +
          '<p>' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
      '</article>';
    }

    if (!q) {
      if (summary) {
        summary.textContent = '请输入关键词开始搜索';
      }
      searchResults.innerHTML = window.SEARCH_MOVIES.slice(0, 24).map(renderCard).join('');
    } else {
      var query = q.toLowerCase();
      var matches = window.SEARCH_MOVIES.filter(function (movie) {
        return movie.search.indexOf(query) !== -1;
      }).slice(0, 120);

      if (summary) {
        summary.textContent = matches.length ? '与“' + q + '”相关的影片' : '未找到相关影片';
      }
      searchResults.innerHTML = matches.map(renderCard).join('');
    }
  }
})();

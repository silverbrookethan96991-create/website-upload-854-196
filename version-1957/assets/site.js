
document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('[data-mobile-menu-button]');
  var menu = document.querySelector('[data-mobile-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var current = 0;
  var heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function startHero() {
    if (!slides.length) {
      return;
    }

    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  if (slides.length) {
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startHero();
      });
    }

    startHero();
  }

  var searchInput = document.getElementById('siteSearch');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list] .movie-card, [data-filter-list] .ranking-item'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-type]'));
  var selectedType = 'all';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter() {
    var query = normalize(searchInput ? searchInput.value : '');

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-category')
      ].join(' ').toLowerCase();

      var type = card.getAttribute('data-type') || '';
      var matchesQuery = !query || haystack.indexOf(query) !== -1;
      var matchesType = selectedType === 'all' || type === selectedType || haystack.indexOf(selectedType.toLowerCase()) !== -1;

      card.classList.toggle('is-hidden', !(matchesQuery && matchesType));
    });
  }

  if (searchInput && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q) {
      searchInput.value = q;
    }

    searchInput.addEventListener('input', applyFilter);
    applyFilter();
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      selectedType = button.getAttribute('data-filter-type') || 'all';

      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });

      applyFilter();
    });
  });

  var playerShortcut = document.querySelector('[data-player-shortcut]');
  var playerButton = document.querySelector('[data-player-trigger]');

  if (playerShortcut && playerButton) {
    playerShortcut.addEventListener('click', function (event) {
      event.preventDefault();
      playerButton.click();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});

(() => {
  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  function initImages() {
    qsa('img').forEach((image) => {
      image.addEventListener('error', () => {
        image.classList.add('image-missing');
      }, { once: true });
    });
  }

  function initMobileMenu() {
    const button = qs('[data-menu-button]');
    const menu = qs('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', () => {
      menu.classList.toggle('is-open');
    });
  }

  function initHeaderSearch() {
    qsa('[data-search-form]').forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const input = qs('[data-search-input]', form);
        const keyword = input ? input.value.trim() : '';
        const target = form.getAttribute('data-search-url') || './movies.html';
        const url = keyword ? `${target}?q=${encodeURIComponent(keyword)}` : target;
        window.location.href = url;
      });
    });
  }

  function initHero() {
    const slides = qsa('[data-hero-slide]');
    const dots = qsa('[data-hero-dot]');
    if (slides.length === 0 || dots.length === 0) {
      return;
    }
    let index = 0;
    let timer = null;
    const show = (next) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };
    const start = () => {
      timer = window.setInterval(() => show(index + 1), 5200);
    };
    const restart = () => {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };
    dots.forEach((dot, dotIndex) => {
      dot.addEventListener('click', () => {
        show(dotIndex);
        restart();
      });
    });
    show(0);
    start();
  }

  function initFilters() {
    const page = qs('[data-movie-list]');
    if (!page) {
      return;
    }
    const cards = qsa('[data-movie-card]', page);
    const search = qs('[data-list-search]');
    const region = qs('[data-region-filter]');
    const genre = qs('[data-genre-filter]');
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('q') || '';
    if (search && initial) {
      search.value = initial;
    }
    const apply = () => {
      const keyword = search ? search.value.trim().toLowerCase() : '';
      const regionValue = region ? region.value : '';
      const genreValue = genre ? genre.value : '';
      cards.forEach((card) => {
        const haystack = [
          card.dataset.title || '',
          card.dataset.region || '',
          card.dataset.genre || '',
          card.dataset.tags || '',
          card.dataset.year || ''
        ].join(' ').toLowerCase();
        const regionOk = !regionValue || (card.dataset.region || '').includes(regionValue);
        const genreOk = !genreValue || (card.dataset.genre || '').includes(genreValue);
        const keywordOk = !keyword || haystack.includes(keyword);
        card.classList.toggle('is-hidden-card', !(regionOk && genreOk && keywordOk));
      });
    };
    [search, region, genre].forEach((control) => {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  function startVideo(frame) {
    const video = qs('video', frame);
    const url = frame.getAttribute('data-stream');
    if (!video || !url) {
      return;
    }
    frame.classList.add('is-playing');
    if (video.dataset.loaded === 'true') {
      video.play().catch(() => {});
      return;
    }
    video.dataset.loaded = 'true';
    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      video._hlsPlayer = hls;
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {});
      }, { once: true });
      return;
    }
    video.src = url;
    video.play().catch(() => {});
  }

  function initPlayers() {
    qsa('[data-player-frame]').forEach((frame) => {
      const button = qs('[data-play-button]', frame);
      const video = qs('video', frame);
      if (button) {
        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          startVideo(frame);
        });
      }
      frame.addEventListener('click', (event) => {
        if (event.target.closest('button')) {
          return;
        }
        if (!video || video.dataset.loaded !== 'true') {
          startVideo(frame);
        }
      });
      if (video) {
        video.addEventListener('play', () => frame.classList.add('is-playing'));
        video.addEventListener('pause', () => {
          if (!video.seeking && video.currentTime === 0) {
            frame.classList.remove('is-playing');
          }
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initImages();
    initMobileMenu();
    initHeaderSearch();
    initHero();
    initFilters();
    initPlayers();
  });
})();

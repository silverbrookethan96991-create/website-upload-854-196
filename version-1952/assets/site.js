(function () {
  var ready = function (fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  };

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var show = function (index) {
        if (!slides.length) return;
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
      setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var filterList = document.querySelector("[data-filter-list]");
    if (filterInput && filterList) {
      var cards = Array.prototype.slice.call(filterList.querySelectorAll("[data-card]"));
      filterInput.addEventListener("input", function () {
        var q = filterInput.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
          card.style.display = !q || text.indexOf(q) !== -1 ? "" : "none";
        });
      });
    }

    var results = document.querySelector("[data-search-results]");
    if (results && window.SEARCH_MOVIES) {
      var params = new URLSearchParams(window.location.search);
      var q = (params.get("q") || "").trim();
      var input = document.querySelector("[data-search-page-input]");
      if (input) input.value = q;
      var needle = q.toLowerCase();
      var list = window.SEARCH_MOVIES.filter(function (item) {
        var hay = [item.t, item.r, item.y, item.g, item.k].join(" ").toLowerCase();
        return !needle || hay.indexOf(needle) !== -1;
      }).slice(0, 120);
      results.innerHTML = list.map(function (item) {
        return [
          '<article class="movie-card" data-card>',
          '<a href="' + item.u + '" class="card-poster"><img src="' + item.c + '" alt="' + item.t.replace(/"/g, "&quot;") + '" loading="lazy"><span class="card-region">' + item.r + '</span><span class="card-year">' + item.y + '</span></a>',
          '<div class="card-body"><h3><a href="' + item.u + '">' + item.t + '</a></h3><p>' + item.o + '</p><div class="card-tags"><span>' + item.g + '</span></div></div>',
          '</article>'
        ].join("");
      }).join("");
    }
  });
})();


(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var button = document.querySelector(".site-menu-toggle");
    var menu = document.querySelector(".site-mobile-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.hidden = !menu.hidden;
      button.textContent = menu.hidden ? "☰" : "×";
    });
  }

  function initCarousel() {
    var carousel = document.querySelector("[data-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var index = slides.findIndex(function (slide) {
      return slide.classList.contains("is-active");
    });
    if (index < 0) {
      index = 0;
    }
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    var prev = carousel.querySelector("[data-prev]");
    var next = carousel.querySelector("[data-next]");
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-goto")) || 0);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5000);
  }

  function initFilter() {
    var input = document.querySelector("[data-filter-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    if (!input || !cards.length) {
      return;
    }
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        card.hidden = q && text.indexOf(q) === -1;
      });
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderResult(item) {
    return [
      "<a href=\"" + escapeHtml(item.url) + "\" class=\"movie-card block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group\">",
      "<div class=\"relative aspect-video overflow-hidden\"><img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" class=\"w-full h-full object-cover group-hover:scale-110 transition-transform duration-300\" loading=\"lazy\"><div class=\"absolute top-3 right-3 flex items-center gap-2\"><span class=\"px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full shadow-lg\">" + escapeHtml(item.region) + "</span></div><div class=\"absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center\"><span class=\"large-play small\">▶</span></div></div>",
      "<div class=\"p-4\"><h3 class=\"text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2\">" + escapeHtml(item.title) + "</h3><p class=\"text-gray-600 text-sm line-clamp-2 mb-2\">" + escapeHtml(item.oneLine) + "</p><div class=\"flex items-center justify-between text-xs text-gray-500\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.type) + "</span></div></div>",
      "</a>"
    ].join("");
  }

  function initSearchPage() {
    var results = document.getElementById("search-results");
    var summary = document.getElementById("search-summary");
    var input = document.querySelector("[data-search-page-input]");
    if (!results || !summary || !input || !window.SITE_SEARCH) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    input.value = query;
    var normalized = query.toLowerCase();
    var items = window.SITE_SEARCH.filter(function (item) {
      if (!normalized) {
        return item.featured;
      }
      return item.searchText.toLowerCase().indexOf(normalized) !== -1;
    }).slice(0, 96);
    summary.textContent = query ? "搜索结果：" + query : "精选推荐";
    if (!items.length) {
      results.innerHTML = "<div class=\"lg:col-span-4 md:col-span-3 bg-white rounded-xl shadow-md p-8 text-gray-600\">没有找到匹配影片，换一个关键词试试。</div>";
      return;
    }
    results.innerHTML = items.map(renderResult).join("");
  }

  ready(function () {
    initMenu();
    initCarousel();
    initFilter();
    initSearchPage();
  });
})();

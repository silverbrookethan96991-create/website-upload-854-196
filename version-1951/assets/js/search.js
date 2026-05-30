(function () {
  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get("q") || "").trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function card(movie) {
    var tags = [movie.region, movie.type].concat(movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      "<article class=\"movie-card\">",
      "  <a href=\"" + escapeHtml(movie.url) + "\" class=\"card-link\">",
      "    <div class=\"card-cover\">",
      "      <img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "      <span class=\"badge badge-region\">" + escapeHtml(movie.region) + "</span>",
      "      <span class=\"badge badge-time\">" + escapeHtml(movie.duration) + "</span>",
      "    </div>",
      "    <div class=\"card-body\">",
      "      <h3>" + escapeHtml(movie.title) + "</h3>",
      "      <p>" + escapeHtml(movie.oneLine) + "</p>",
      "      <div class=\"card-tags\">" + tags + "</div>",
      "      <div class=\"card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + Number(movie.views).toLocaleString() + " 次观看</span></div>",
      "    </div>",
      "  </a>",
      "</article>"
    ].join("\n");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var input = document.getElementById("searchInput");
    var title = document.getElementById("searchTitle");
    var result = document.getElementById("searchResults");
    var query = getQuery();
    var source = Array.isArray(MOVIES) ? MOVIES : [];

    if (input) {
      input.value = query;
    }

    var keywords = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matches = source.filter(function (movie) {
      if (!keywords.length) {
        return true;
      }
      var haystack = [movie.title, movie.oneLine, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" ")].join(" ").toLowerCase();
      return keywords.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    }).slice(0, 120);

    if (title) {
      title.textContent = query ? "“" + query + "”的搜索结果" : "热门影片";
    }

    if (result) {
      result.innerHTML = matches.length ? matches.map(card).join("\n") : "<div class=\"empty-state\">暂未找到匹配内容</div>";
    }
  });
})();

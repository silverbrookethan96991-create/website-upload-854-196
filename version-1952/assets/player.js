(function () {
  var ready = function (fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  };

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector(".play-cover");
      var stream = box.getAttribute("data-stream");
      var attached = false;
      var hls;
      var attach = function () {
        if (attached || !video || !stream) return;
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      };
      var start = function () {
        attach();
        box.classList.add("is-playing");
        var play = video.play();
        if (play && typeof play.catch === "function") {
          play.catch(function () {
            box.classList.remove("is-playing");
          });
        }
      };
      if (button) {
        button.addEventListener("click", start);
      }
      video.addEventListener("play", function () {
        box.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (!video.currentTime) {
          box.classList.remove("is-playing");
        }
      });
      video.addEventListener("ended", function () {
        box.classList.remove("is-playing");
      });
      box.addEventListener("click", function (event) {
        if (event.target === box) {
          start();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  });
})();

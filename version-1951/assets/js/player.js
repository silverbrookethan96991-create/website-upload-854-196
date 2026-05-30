function initMoviePlayer(options) {
  var video = document.getElementById(options.videoId);
  var play = document.getElementById(options.playId);
  var url = options.url;
  var hls = null;
  var prepared = false;

  if (!video || !play || !url) {
    return;
  }

  function prepare() {
    if (prepared) {
      return;
    }

    prepared = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.load();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
    }
  }

  function start() {
    prepare();
    play.classList.add("is-hidden");

    var run = function () {
      var task = video.play();
      if (task && typeof task.catch === "function") {
        task.catch(function () {});
      }
    };

    if (video.readyState > 0) {
      run();
    } else {
      video.addEventListener("loadedmetadata", run, { once: true });
      setTimeout(run, 800);
    }
  }

  play.addEventListener("click", start);

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener("play", function () {
    play.classList.add("is-hidden");
  });

  video.addEventListener("pause", function () {
    if (!video.ended) {
      play.classList.remove("is-hidden");
    }
  });

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

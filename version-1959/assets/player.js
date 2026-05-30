(function () {
  function setupPlayer(player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    var src = player.getAttribute('data-src');

    if (!video || !src) {
      return;
    }

    function markPlaying() {
      player.classList.add('playing');
    }

    function markPaused() {
      if (video.paused) {
        player.classList.remove('playing');
      }
    }

    function loadVideo() {
      if (video.getAttribute('data-ready') === 'true') {
        return;
      }

      video.setAttribute('data-ready', 'true');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        player.classList.add('player-error');
      }
    }

    function beginPlayback() {
      loadVideo();
      markPlaying();
      var playAttempt = video.play();

      if (playAttempt && typeof playAttempt.catch === 'function') {
        playAttempt.catch(function () {
          player.classList.remove('playing');
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', beginPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        beginPlayback();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', markPlaying);
    video.addEventListener('pause', markPaused);
  }

  var players = document.querySelectorAll('.movie-player');
  players.forEach(setupPlayer);
})();

(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initPlayer(card) {
    var video = card.querySelector('.player-video');
    var playButton = card.querySelector('.js-play-button');
    var fullscreenButton = card.querySelector('.js-fullscreen-button');
    var sourceButtons = Array.prototype.slice.call(card.querySelectorAll('.source-button'));
    var hlsInstance = null;
    var currentSource = card.getAttribute('data-video-src');

    function destroyHls() {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    }

    function loadSource(source) {
      if (!video || !source) {
        return;
      }
      destroyHls();
      card.classList.remove('playing');

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          card.classList.add('ready');
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            card.classList.remove('ready');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          card.classList.add('ready');
        }, { once: true });
      }
    }

    function play() {
      if (!video) {
        return;
      }
      if (!card.classList.contains('ready')) {
        loadSource(currentSource);
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(function () {
          card.classList.add('playing');
        }).catch(function () {
          card.classList.add('ready');
        });
      } else {
        card.classList.add('playing');
      }
    }

    if (playButton) {
      playButton.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('play', function () {
        card.classList.add('playing');
      });
      video.addEventListener('pause', function () {
        card.classList.remove('playing');
      });
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
    }

    sourceButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        currentSource = button.getAttribute('data-src');
        sourceButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        loadSource(currentSource);
        play();
      });
    });

    if (fullscreenButton) {
      fullscreenButton.addEventListener('click', function () {
        if (!document.fullscreenElement) {
          card.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      });
    }
  }

  ready(function () {
    document.querySelectorAll('.js-player').forEach(initPlayer);
  });
}());

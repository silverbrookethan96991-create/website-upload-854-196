
import { H as Hls } from './hls-vendor-dru42stk.js';

export function initPlayer(source) {
  var video = document.querySelector('[data-player-video]');
  var trigger = document.querySelector('[data-player-trigger]');
  var hls = null;
  var attached = false;

  if (!video || !source) {
    return;
  }

  function playVideo() {
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  function attachSource() {
    if (!attached) {
      attached = true;
      video.controls = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, playVideo);
      } else {
        video.src = source;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
      }
    }

    if (trigger) {
      trigger.classList.add('is-hidden');
    }

    playVideo();
  }

  if (trigger) {
    trigger.addEventListener('click', attachSource);
  }

  video.addEventListener('click', attachSource, { once: true });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

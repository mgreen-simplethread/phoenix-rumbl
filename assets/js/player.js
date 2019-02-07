import EventEmitter from 'eventemitter3';

class Player extends EventEmitter {
  static init(domId, onReady) {
    const video = document.getElementById(domId);

    if (!video) return;

    const { playerId } = video.dataset;

    return new Player(video.id, { playerId, onReady });
  }

  constructor(domId, { playerId, onReady }) {
    super();

    this.domId = domId;
    this.playerId = playerId;
    this.elem = document.getElementById(this.domId);
    this.player = null;

    this.on('playerReady', onReady);

    window.onYouTubeIframeAPIReady = () => this.onIframeReady();

    this.embedYouTubeJS();
  }

  get currentTime() {
    return Math.floor(this.player.getCurrentTime() * 1000);
  }

  embedYouTubeJS() {
    const script = document.createElement('script');
    script.src = '//www.youtube.com/iframe_api';
    document.head.appendChild(script);
  }

  onIframeReady() {
    this.player = new YT.Player(this.domId, {
      height: '360',
      width: '420',
      videoId: this.playerId,
      events: {
        onReady: (evt) => this.emit('playerReady', evt),
        onStateChange: (evt) => this.emit('playerStateChange', evt),
      },
    });
  }

  seekTo(millis) {
    return this.player.seekTo(millis / 1000);
  }
}

export default Player;

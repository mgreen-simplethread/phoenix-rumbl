import Player from './player';
import nanohtml from 'nanohtml';
import raw from 'nanohtml/raw';

class Video {
  static init(socket, element) {
    if (!socket || !element) return;
    return new Video(socket, element);
  }

  constructor(socket, element) {
    this.element = element;
    this.playerId = this.element.dataset.playerId || '';
    this.videoId = this.element.dataset.id || '';
    this.socket = socket;
    this.player = this.initPlayer();
    this.lastSeenId = 0;
    this.ui = {
      msgContainer: document.querySelector('#msg-container'),
      msgInput: document.querySelector('#msg-input'),
      postButton: document.querySelector('#msg-submit'),
    };
    this.vidChannel = null;
    console.debug('Video instance: %O', this);
  }

  initPlayer() {
    return Player.init(this.element.id, () => {
      this.onReady(this.videoId, this.socket);
    });
  }

  onReady() {
    this.socket.connect();
    this.vidChannel = this.socket.channel(`videos:${this.videoId}`, () => ({ last_seen_id: this.lastSeenId }));

    this.bindUI();
    this.connectChannel();
  }

  connectChannel() {
    this.vidChannel
      .join()
      .receive('ok', ({ annotations }) => {
        const ids = annotations.map(({ id }) => id);
        if (ids.length > 0) this.lastSeenId = Math.max(...ids);
        this.scheduleMessages(annotations);
      })
      .receive('error', (reason) => console.warn('join failed: %O', reason));
    this.vidChannel.on('ping', ({ count }) => console.debug('PING %d', count));
    this.vidChannel.on('new_annotation', (resp) => {
      this.lastSeenId = resp.id;
      this.renderAnnotation(resp);
    });
  }

  bindUI() {
    const { postButton, msgInput, msgContainer } = this.ui;

    postButton.addEventListener('click', (evt) => {
      const payload = { body: msgInput.value, at: this.player.currentTime };
      this.vidChannel.push('new_annotation', payload).receive('error', (err) => console.warn(err));
      msgInput.value = '';
    });

    msgContainer.addEventListener('click', (evt) => {
      evt.preventDefault();
      const seconds = evt.target.dataset.seek || evt.target.parentNode.dataset.seek;
      if (!seconds) return;
      this.player.seekTo(seconds);
    });
  }

  renderAnnotation({ user, body, at }) {
    const { msgContainer } = this.ui;
    const template = nanohtml`
      <div>
        <a href="#" data-seek="${at}">
          [${this.formatTime(at)}]
          <b>${raw(user.username)}</b>: ${raw(body)}
        </a>
      </div>
    `;
    msgContainer.appendChild(template);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  scheduleMessages(annotations) {
    clearTimeout(this.scheduleTimer);
    this.scheduleTimer = setTimeout(() => {
      const playTime = this.player.currentTime;
      const remaining = this.renderAtTime(annotations, playTime);
      this.scheduleMessages(remaining);
    }, 1000);
  }

  renderAtTime(annotations, currentTime) {
    return annotations.filter((ann) => {
      if (ann.at > currentTime) return true;
      this.renderAnnotation(ann);
      return false;
    });
  }

  formatTime(time) {
    const date = new Date(null);
    date.setSeconds(time / 1000);
    return date.toISOString().substr(14, 5);
  }
}

export default Video;

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
    this.vidChannel = this.socket.channel(`videos:${this.videoId}`);

    this.bindUI();
    this.connectChannel();
  }

  connectChannel() {
    this.vidChannel
      .join()
      .receive('ok', (resp) => console.log('Joined video channel: %O', resp))
      .receive('error', (reason) => console.warn('join failed: %O', reason));
    this.vidChannel.on('ping', ({ count }) => console.debug('PING %d', count));
    this.vidChannel.on('new_annotation', (resp) => this.renderAnnotation(resp));
  }

  bindUI() {
    const { postButton, msgInput } = this.ui;

    postButton.addEventListener('click', (evt) => {
      const payload = { body: msgInput.value, at: this.player.currentTime };
      this.vidChannel.push('new_annotation', payload).receive('error', (err) => console.warn(err));
      msgInput.value = '';
    });
  }

  renderAnnotation({ user, body, at }) {
    const { msgContainer } = this.ui;
    const template = nanohtml`
      <div>
        <a href="#" data-seek="${raw(at)}">
          <b>${raw(user.username)}</b>: ${raw(body)}
        </a>
      </div>
    `;
    msgContainer.appendChild(template);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }
}

export default Video;

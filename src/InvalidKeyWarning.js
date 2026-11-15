import { KeyGuide } from './KeyGuide.js';

/** A keyboard reminder. Trial timing and continuation belong to SrtTrial. */
export class InvalidKeyWarning {
  constructor(element, config) {
    this.element = element;
    this.config = config;
  }

  show() {
    this.hide();
    this.overlay = document.createElement('div');
    this.overlay.className = 'invalid-key-warning';
    this.overlay.setAttribute('role', 'alert');
    const box = document.createElement('section');
    box.className = 'invalid-key-box';
    const message = document.createElement('p');
    message.textContent = this.config.instructions.invalidKey;
    const keys = KeyGuide.create(this.config.positions);
    const continuation = document.createElement('p');
    continuation.textContent = this.config.instructions.invalidKeyContinue;
    box.append(message, keys, continuation);
    this.overlay.append(box);
    this.element.append(this.overlay);
  }

  hide() {
    this.overlay?.remove();
    this.overlay = null;
  }
}

/** Tracks physical keys across trials, including keys held during the interval. */
export class ResponseCollector {
  constructor(positions, target = window) {
    this.positions = positions;
    this.target = target;
    this.held = new Set();
    this.listener = null;
    this.onDown = event => {
      const wasHeld = this.held.has(event.code);
      this.held.add(event.code);
      if (this.listener) {
        event.preventDefault();
        this.listener({ code: event.code, key: event.key, repeated: event.repeat || wasHeld,
          timestamp: performance.now(), browserTimestamp: event.timeStamp });
      }
    };
    this.onUp = event => this.held.delete(event.code);
    target.addEventListener('keydown', this.onDown);
    target.addEventListener('keyup', this.onUp);
  }

  watch(listener) { this.listener = listener; }
  stopWatching() { this.listener = null; }
  positionFor(code) { return this.positions.find(position => position.keyCode === code)?.id ?? null; }

  dispose() {
    this.target.removeEventListener('keydown', this.onDown);
    this.target.removeEventListener('keyup', this.onUp);
    this.listener = null;
  }
}

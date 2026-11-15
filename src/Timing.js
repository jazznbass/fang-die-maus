/** Frame-aligned scheduling. These timestamps estimate, not measure, screen onset. */
export class Timing {
  static frameAt(deadline, signal, draw = () => {}) {
    return new Promise((resolve, reject) => {
      let frame;
      const cancel = () => {
        cancelAnimationFrame(frame);
        reject(new DOMException('Trial interrupted', 'AbortError'));
      };
      const check = () => {
        if (performance.now() < deadline) {
          frame = requestAnimationFrame(check);
          return;
        }
        signal.removeEventListener('abort', cancel);
        draw();
        resolve(performance.now());
      };
      if (signal.aborted) return cancel();
      signal.addEventListener('abort', cancel, { once: true });
      frame = requestAnimationFrame(check);
    });
  }

  static until(deadline, signal) {
    return new Promise((resolve, reject) => {
      let timer;
      const cancel = () => {
        clearTimeout(timer);
        reject(new DOMException('Trial interrupted', 'AbortError'));
      };
      const check = () => {
        const remaining = deadline - performance.now();
        if (remaining > 0) timer = setTimeout(check, remaining);
        else {
          signal.removeEventListener('abort', cancel);
          resolve();
        }
      };
      if (signal.aborted) return cancel();
      signal.addEventListener('abort', cancel, { once: true });
      check();
    });
  }
}

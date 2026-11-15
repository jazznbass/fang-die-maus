import { KeyGuide } from './KeyGuide.js';

/** A keyboard-only preparation screen before the first timed stimulus. */
export function createReadyPlugin(context) {
  return class ReadyPlugin {
    static info = { name: 'srt-ready', version: '0.1.0', parameters: {}, data: {} };

    constructor(jsPsych) { this.jsPsych = jsPsych; }

    trial(element) {
      const screen = document.createElement('section');
      screen.className = 'ready-screen';
      const heading = document.createElement('h1');
      heading.textContent = context.config.instructions.ready;
      const prompt = document.createElement('p');
      prompt.textContent = context.config.instructions.readyContinue;
      screen.append(heading, KeyGuide.create(context.config.positions), prompt);
      element.replaceChildren(screen);
      context.responses.watch(input => {
        if (input.repeated) return;
        context.responses.stopWatching();
        if (input.code === 'Escape') context.stopReason = 'operator_escape';
        // ResponseCollector keeps the start key held until its keyup event.
        // It therefore cannot also answer the first mouse.
        this.jsPsych.finishTrial({ continuationKey: input.code });
      });
    }
  };
}

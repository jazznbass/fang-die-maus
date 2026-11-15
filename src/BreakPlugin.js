import { BlockSummary } from './BlockSummary.js';
import { BlockSummaryDisplay } from './BlockSummaryDisplay.js';

/** Keyboard-only break. The continuation key cannot also answer the next trial. */
export function createBreakPlugin(context) {
  return class BreakPlugin {
    static info = {
      name: 'srt-break', version: '0.1.0',
      parameters: {
        block: { type: jsPsychModule.ParameterType.INT, default: undefined },
        previousBlock: { type: jsPsychModule.ParameterType.INT, default: undefined },
        message: { type: jsPsychModule.ParameterType.STRING, default: undefined },
      },
      data: {},
    };

    constructor(jsPsych) { this.jsPsych = jsPsych; }

    trial(element, parameters) {
      element.innerHTML = '<section class="card block-break"><p class="eyebrow">PAUSE</p><h1></h1><div class="summary-container"></div><p class="encouragement"></p><p class="break-message"></p></section>';
      element.querySelector('h1').textContent = `Bereit für Runde ${parameters.block}?`;
      element.querySelector('.break-message').textContent = parameters.message;
      const summary = BlockSummary.fromTrials(context.trials, parameters.previousBlock);
      if (context.config.breaks.showSummary) {
        element.querySelector('.eyebrow').textContent = parameters.previousBlock === 0
          ? 'ÜBUNG GESCHAFFT' : `RUNDE ${parameters.previousBlock} GESCHAFFT`;
        new BlockSummaryDisplay(element.querySelector('.summary-container')).render(summary);
        element.querySelector('.encouragement').textContent = context.config.instructions.blockEncouragement;
      }
      const heldAtStart = new Set(context.responses.held);
      const release = event => heldAtStart.delete(event.code);
      const continueWithKey = event => {
        if (event.repeat || heldAtStart.has(event.code)) return;
        event.preventDefault();
        window.removeEventListener('keydown', continueWithKey);
        window.removeEventListener('keyup', release);
        // A self-paced break has no response-to-stimulus timing anchor.
        context.previousResponseAt = null;
        context.previousIntervalAnchor = null;
        context.nextOnsetAt = null;
        this.jsPsych.finishTrial({ continuationKey: event.code, summary });
      };
      window.addEventListener('keyup', release);
      window.addEventListener('keydown', continueWithKey);
    }
  };
}

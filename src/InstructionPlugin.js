import { InstructionDisplay } from './InstructionDisplay.js';

/** A fresh key advances one page; held keys cannot skip instructions. */
export function createInstructionPlugin(context, condition) {
  return class InstructionPlugin {
    static info = {
      name: 'srt-instructions', version: '0.1.0',
      parameters: { page: { type: jsPsychModule.ParameterType.INT, default: 0 } }, data: {},
    };

    constructor(jsPsych) { this.jsPsych = jsPsych; }

    trial(element, { page }) {
      InstructionDisplay.render(element, context.config, page, condition);
      context.responses.watch(input => {
        if (input.repeated) return;
        context.responses.stopWatching();
        if (input.code === 'Escape') context.stopReason = 'operator_escape';
        this.jsPsych.finishTrial({ page, continuationKey: input.code });
      });
    }
  };
}

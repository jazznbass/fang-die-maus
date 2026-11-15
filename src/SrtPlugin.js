import { SrtTrial } from './SrtTrial.js';

/** Thin jsPsych adapter. Experiment creates a class bound to its session context. */
export function createSrtPlugin(context) {
  return class SrtPlugin {
    static info = {
      name: 'mouse-srt', version: '0.1.0',
      parameters: { descriptor: { type: jsPsychModule.ParameterType.OBJECT, default: undefined } },
      data: {},
    };

    constructor(jsPsych) { this.jsPsych = jsPsych; }

    async trial(element, parameters) {
      const trial = new SrtTrial(element, parameters.descriptor, context);
      try {
        const result = await trial.run();
        this.jsPsych.finishTrial(result);
      } catch (error) {
        context.stopReason = `program_error: ${error.message}`;
        this.jsPsych.finishTrial({ ...trial.result, interrupted: true,
          interruptionReason: context.stopReason });
      }
    }
  };
}

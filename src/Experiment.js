import { TrialPlanner } from './TrialPlanner.js';
import { ResponseCollector } from './ResponseCollector.js';
import { MouseDisplay } from './MouseDisplay.js';
import { createSrtPlugin } from './SrtPlugin.js';
import { createReadyPlugin } from './ReadyPlugin.js';
import { createInstructionPlugin } from './InstructionPlugin.js';
import { Screens } from './Screens.js';

/** Owns a session; leaves individual trial behavior to SrtTrial. */
export class Experiment {
  constructor(config, participantId, condition, store) {
    this.store = store;
    const seed = config.randomization.seed ?? crypto.getRandomValues(new Uint32Array(1))[0];
    const resolved = structuredClone(config);
    resolved.randomization.seed = seed;
    this.session = {
      id: crypto.randomUUID(), participantId, condition, seed, config: resolved,
      appVersion: '0.1.0', plannerVersion: 'mulberry32-v1', jsPsychVersion: '8.3.0',
      startedAt: new Date().toISOString(), endedAt: null, status: 'running', stopReason: null,
      environment: { userAgent: navigator.userAgent, language: navigator.language,
        screenWidth: screen.width, screenHeight: screen.height, devicePixelRatio,
        viewportWidth: innerWidth, viewportHeight: innerHeight, timeOrigin: performance.timeOrigin },
      plan: new TrialPlanner(resolved, condition, seed).build(), trials: [],
    };
    this.context = { config: resolved, trials: this.session.trials, responses: null, nextOnsetAt: null,
      previousResponseAt: null, stopReason: null };
  }

  async run() {
    const { session, context } = this;
    await MouseDisplay.preload();
    this.store.save(session);
    context.responses = new ResponseCollector(context.config.positions);
    const taskPlugin = createSrtPlugin(context);
    document.querySelector('#experiment').replaceChildren();
    this.jsPsych = jsPsychModule.initJsPsych({
      display_element: 'experiment', default_iti: 0, minimum_valid_rt: 0,
      on_trial_finish: data => {
        if (data.trial_type !== 'mouse-srt') return;
        session.trials.push(structuredClone(data));
        try { this.store.save(session); }
        catch (error) { context.stopReason = `local_save_failed: ${error.message}`; }
      },
    });
    const instructionPlugin = createInstructionPlugin(context, session.condition);
    const timeline = [0, 1, 2].map(page => this.unlessStopped({ type: instructionPlugin, page }));
    // Keep the experimental condition's extra information separate and readable.
    if (context.config.conditions[session.condition].additionalInstruction.trim()) {
      timeline.push(this.unlessStopped({ type: instructionPlugin, page: 3 }));
    }
    timeline.push(this.unlessStopped({ type: createReadyPlugin(context) }));
    let previousBlock = session.plan[0].block;
    for (const descriptor of session.plan) {
      if (descriptor.block !== previousBlock && context.config.breaks.betweenBlocks) {
        timeline.push(this.unlessStopped(Screens.break(context.config, descriptor.block, context, previousBlock)));
      }
      timeline.push(this.unlessStopped({ type: taskPlugin, descriptor }));
      previousBlock = descriptor.block;
    }
    try {
      await this.jsPsych.run(timeline);
      session.status = context.stopReason ? 'interrupted' : 'completed';
    } catch (error) {
      session.status = 'error';
      context.stopReason = error.message;
    } finally {
      context.responses.dispose();
      session.endedAt = new Date().toISOString();
      session.stopReason = context.stopReason;
      try { this.store.save(session); }
      catch (error) { session.saveError = error.message; }
    }
    return session;
  }

  unlessStopped(trial) {
    return { timeline: [trial], conditional_function: () => !this.context.stopReason };
  }
}

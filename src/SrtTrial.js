import { MouseDisplay } from './MouseDisplay.js';
import { InvalidKeyWarning } from './InvalidKeyWarning.js';
import { Timing } from './Timing.js';

/** One trial. All phase changes and time origins are explicit here. */
export class SrtTrial {
  constructor(element, descriptor, context) {
    Object.assign(this, { descriptor, context });
    this.display = new MouseDisplay(element, context.config);
    this.warning = new InvalidKeyWarning(element, context.config);
    this.controller = new AbortController();
    this.phase = 'interval';
    this.result = { ...descriptor, outcome: null, correct: null, responseCode: null,
      responseKey: null, rtMs: null, onsetTimestampMs: null, responseTimestampMs: null,
      timeoutTimestampMs: null, previousIntervalAnchor: context.previousIntervalAnchor ?? null,
      intervalFromPreviousResponseMs: null, feedbackOnsetTimestampMs: null,
      feedbackOffsetTimestampMs: null, interrupted: false, interruptionReason: null,
      valid_resoponse: 1, stimulusOnsetsMs: [], inputEvents: [] };
  }

  async run() {
    const { context, result, controller } = this;
    const stopOnBlur = () => this.interrupt('focus_lost');
    const stopOnHidden = () => { if (document.hidden) this.interrupt('tab_hidden'); };
    window.addEventListener('blur', stopOnBlur);
    document.addEventListener('visibilitychange', stopOnHidden);
    context.responses.watch(input => this.handleInput(input));
    this.display.mount();
    try {
      if (document.hidden || !document.hasFocus()) this.interrupt('not_focused_at_trial_start');
      result.onsetTimestampMs = await Timing.frameAt(context.nextOnsetAt ?? 0, controller.signal,
        () => this.display.showTarget(this.descriptor.target));
      if (context.previousResponseAt !== null) {
        result.intervalFromPreviousResponseMs = result.onsetTimestampMs - context.previousResponseAt;
      }
      result.stimulusOnsetsMs.push(result.onsetTimestampMs);
      while (await this.waitForResponse() === 'retry') {
        await this.waitForResponse('warning');
        this.warning.hide();
        result.onsetTimestampMs = await Timing.frameAt(0, controller.signal,
          () => this.display.showTarget(this.descriptor.target));
        result.stimulusOnsetsMs.push(result.onsetTimestampMs);
      }
      const responseAt = result.responseTimestampMs ?? result.timeoutTimestampMs;
      context.previousResponseAt = responseAt;
      context.previousIntervalAnchor = result.outcome;
      context.nextOnsetAt = responseAt + context.config.timing.responseToNextStimulusMs;
      if (context.config.timing.feedbackDurationMs === 0) {
        this.display.clear();
        return result;
      }
      this.phase = 'feedback';
      result.feedbackOnsetTimestampMs = await Timing.frameAt(0, controller.signal,
        () => this.display.showFeedback(this.descriptor.target, result.correct === true));
      // Feedback is contained in the response-to-next-stimulus interval.
      result.feedbackOffsetTimestampMs = await Timing.frameAt(
        responseAt + context.config.timing.feedbackDurationMs, controller.signal,
        () => this.display.clear());
      this.phase = 'interval';
      // The next trial waits for nextOnsetAt. This avoids adding a second RSI.
    } catch (error) {
      if (error.name !== 'AbortError') throw error;
    } finally {
      context.responses.stopWatching();
      clearTimeout(this.deadlineTimer);
      this.warning.hide();
      window.removeEventListener('blur', stopOnBlur);
      document.removeEventListener('visibilitychange', stopOnHidden);
      this.phase = 'finished';
    }
    return result;
  }

  waitForResponse(phase = 'stimulus') {
    this.phase = phase;
    return new Promise((resolve, reject) => {
      const cancel = () => reject(new DOMException('Trial interrupted', 'AbortError'));
      if (this.controller.signal.aborted) return cancel();
      this.controller.signal.addEventListener('abort', cancel, { once: true });
      this.acceptResponse = (action = 'response') => {
        clearTimeout(this.deadlineTimer);
        this.controller.signal.removeEventListener('abort', cancel);
        this.phase = action === 'retry' ? 'warning' : 'interval';
        resolve(action);
      };
      const deadline = this.context.config.timing.responseDeadlineMs;
      if (phase === 'stimulus' && deadline !== null) {
        const checkDeadline = () => {
          const remaining = this.result.onsetTimestampMs + deadline - performance.now();
          if (remaining > 0) this.deadlineTimer = setTimeout(checkDeadline, remaining);
          else this.timeout();
        };
        checkDeadline();
      }
    });
  }

  handleInput(input) {
    if (input.code === 'Escape') return this.interrupt('operator_escape');
    const position = this.context.responses.positionFor(input.code);
    const reason = this.inputReason(input, position);
    this.result.inputEvents.push({ ...input, phase: this.phase, reason });
    if (reason === 'warning_continue') return this.acceptResponse('continue');
    if (!['accepted', 'unmapped_key'].includes(reason)) return;
    const deadline = this.context.config.timing.responseDeadlineMs;
    if (deadline !== null && input.timestamp - this.result.onsetTimestampMs > deadline) {
      this.result.inputEvents.at(-1).reason = 'after_deadline';
      return this.timeout();
    }
    if (reason === 'unmapped_key') {
      this.result.valid_resoponse = 0;
      this.display.clear();
      this.warning.show();
      return this.acceptResponse('retry');
    }
    Object.assign(this.result, {
      responseCode: input.code, responseKey: input.key, responseTimestampMs: input.timestamp,
      rtMs: input.timestamp - this.result.onsetTimestampMs,
      correct: position === this.descriptor.target, outcome: 'response',
    });
    this.acceptResponse();
  }

  inputReason(input, position) {
    if (input.repeated) return 'held_or_repeat';
    if (this.phase === 'warning') return 'warning_continue';
    if (this.phase !== 'stimulus') return 'outside_response_window';
    return position === null ? 'unmapped_key' : 'accepted';
  }

  timeout() {
    if (this.phase !== 'stimulus') return;
    this.result.timeoutTimestampMs = performance.now();
    this.result.outcome = 'timeout';
    this.result.correct = false;
    this.acceptResponse();
  }

  interrupt(reason) {
    if (this.controller.signal.aborted) return;
    this.result.interrupted = true;
    this.result.interruptionReason = reason;
    this.result.outcome ??= 'interrupted';
    this.context.stopReason = reason;
    this.controller.abort();
  }
}

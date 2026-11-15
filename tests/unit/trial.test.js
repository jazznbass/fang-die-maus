import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Timing } from '../../src/Timing.js';
import { SrtTrial } from '../../src/SrtTrial.js';

function stimulusTrial() {
  const context = { config: { timing: { responseDeadlineMs: null } },
    responses: { positionFor: code => ({ KeyZ: 1, KeyX: 2 })[code] ?? null } };
  const trial = new SrtTrial(null, { target: 1 }, context);
  trial.phase = 'stimulus';
  trial.result.onsetTimestampMs = 100;
  trial.acceptResponse = () => { trial.phase = 'response_recorded'; };
  return trial;
}

const press = (code, timestamp = 350, repeated = false) => ({ code, key: code,
  timestamp, browserTimestamp: timestamp, repeated });

test('RT ends at the first mapped response; later input cannot overwrite it', () => {
  const trial = stimulusTrial();
  trial.handleInput(press('KeyZ'));
  assert.equal(trial.result.rtMs, 250);
  assert.equal(trial.result.correct, true);
  trial.handleInput(press('KeyX', 700));
  assert.equal(trial.result.rtMs, 250);
  assert.equal(trial.result.responseCode, 'KeyZ');
});

test('wrong mapped responses remain valid; repeated keys are ignored', () => {
  const trial = stimulusTrial();
  trial.handleInput(press('KeyZ', 360, true));
  assert.equal(trial.phase, 'stimulus');
  trial.handleInput(press('KeyX', 400));
  assert.equal(trial.phase, 'response_recorded');
  assert.equal(trial.result.correct, false);
  assert.equal(trial.result.valid_resoponse, 1);
  assert.equal(trial.result.rtMs, 300);
  assert.deepEqual(trial.result.inputEvents.map(event => event.reason),
    ['held_or_repeat', 'accepted']);
});

test('early responses are logged and do not carry into the next stimulus', () => {
  const trial = stimulusTrial();
  trial.phase = 'interval';
  trial.handleInput(press('KeyZ', 90));
  assert.equal(trial.result.rtMs, null);
  assert.equal(trial.result.inputEvents[0].reason, 'outside_response_window');
  trial.phase = 'stimulus';
  trial.handleInput(press('KeyX', 350));
  assert.equal(trial.result.responseCode, 'KeyX');
});

test('responses after the deadline become timeouts with missing RT', () => {
  const trial = stimulusTrial();
  trial.context.config.timing.responseDeadlineMs = 200;
  trial.handleInput(press('KeyZ', 301));
  assert.equal(trial.result.outcome, 'timeout');
  assert.equal(trial.result.responseCode, null);
  assert.equal(trial.result.responseTimestampMs, null);
  assert.equal(typeof trial.result.timeoutTimestampMs, 'number');
  assert.equal(trial.result.rtMs, null);
  assert.equal(trial.result.inputEvents[0].reason, 'after_deadline');
});

test('interruption preserves a response already recorded during this trial', () => {
  const trial = stimulusTrial();
  trial.handleInput(press('KeyZ'));
  trial.interrupt('focus_lost');
  assert.equal(trial.result.interrupted, true);
  assert.equal(trial.result.rtMs, 250);
  assert.equal(trial.context.stopReason, 'focus_lost');
  assert.equal(trial.controller.signal.aborted, true);
});

// Exercise the complete trial with controlled display frames and real input handling.
test('warnings repeat the same target, restart RT and retain validity 0', async t => {
  t.mock.method(Timing, 'frameAt', async (deadline, signal, draw) => {
    if (signal.aborted) throw new DOMException('Stopped', 'AbortError');
    draw();
    return [100, 500, 900][frame++];
  });
  let frame = 0;
  const oldWindow = globalThis.window;
  const oldDocument = globalThis.document;
  globalThis.window = new EventTarget();
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, hasFocus: () => true });
  t.after(() => { globalThis.window = oldWindow; globalThis.document = oldDocument; });
  const trial = stimulusTrial();
  trial.context.previousResponseAt = null;
  trial.context.config.timing.feedbackDurationMs = 0;
  trial.context.config.timing.responseToNextStimulusMs = 500;
  trial.context.responses.watch = () => {};
  trial.context.responses.stopWatching = () => {};
  const targets = [];
  trial.display = { mount() {}, clear() {}, showTarget: id => targets.push(id) };
  let visible = false;
  trial.warning = { show() { visible = true; }, hide() { visible = false; } };
  const running = trial.run();
  await Promise.resolve();
  for (const timestamp of [200, 600]) {
   trial.handleInput(press('KeyA', timestamp));
    await Promise.resolve();
    assert.equal(visible, true);
    assert.equal(trial.phase, 'warning');
   trial.handleInput(press('KeyA', timestamp + 10, true));
    assert.equal(trial.phase, 'warning');
   trial.handleInput(press('KeyZ', timestamp + 20));
    await Promise.resolve();
    await Promise.resolve();
    assert.equal(visible, false);
    assert.equal(trial.phase, 'stimulus');
    assert.equal(trial.result.responseCode, null);
  }
  trial.handleInput(press('KeyZ', 1100));
  const result = await running;
  assert.deepEqual(targets, [1, 1, 1]);
  assert.deepEqual(result.stimulusOnsetsMs, [100, 500, 900]);
  assert.equal(result.rtMs, 200);
  assert.equal(result.valid_resoponse, 0);
  assert.equal(result.correct, true);
});

test('warning cancels the response deadline and Escape interrupts it', async () => {
  const trial = stimulusTrial();
  trial.result.onsetTimestampMs = performance.now();
  trial.context.config.timing.responseDeadlineMs = 20;
  trial.display = { clear() {} };
  trial.warning = { show() {} };
  const first = trial.waitForResponse();
  trial.handleInput(press('KeyA', performance.now()));
  assert.equal(await first, 'retry');
  const warning = trial.waitForResponse('warning');
  await new Promise(resolve => setTimeout(resolve, 40));
  assert.equal(trial.phase, 'warning');
  assert.equal(trial.result.outcome, null);
  trial.handleInput(press('Escape'));
  await assert.rejects(warning, { name: 'AbortError' });
  assert.equal(trial.result.valid_resoponse, 0);
});

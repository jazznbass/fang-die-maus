import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ResponseCollector } from '../../src/ResponseCollector.js';
import { ResultExporter } from '../../src/ResultExporter.js';

test('held keys are tracked even before a trial listener is attached', () => {
  const target = new EventTarget();
  const collector = new ResponseCollector([{ id: 1, keyCode: 'KeyZ' }], target);
  const send = (type, code, repeat = false) => {
    const event = new Event(type, { cancelable: true });
    Object.assign(event, { code, key: 'z', repeat });
    target.dispatchEvent(event);
  };
  send('keydown', 'KeyZ');
  const inputs = [];
  collector.watch(input => inputs.push(input));
  send('keydown', 'KeyZ');
  assert.equal(inputs[0].repeated, true);
  send('keyup', 'KeyZ');
  send('keydown', 'KeyZ');
  assert.equal(inputs[1].repeated, false);
  assert.equal(collector.positionFor('KeyZ'), 1);
  assert.equal(collector.positionFor('KeyA'), null);
  collector.dispose();
  send('keydown', 'KeyZ');
  assert.equal(inputs.length, 2);
});

test('CSV retains missing RT, false correctness, nested events and quoted text', () => {
  const session = { participantId: 'TEST', id: 'session', condition: 'implicit', seed: 0,
    trials: [{ valid_resoponse: 0, rtMs: null, correct: false, responseKey: '"', interrupted: true,
      inputEvents: [{ code: 'KeyA', reason: 'unmapped_key' }] }] };
  const csv = ResultExporter.csv(session);
  assert.equal(csv.split('\r\n').length, 2);
  assert.match(csv, /"false"/);
  assert.match(csv, /unmapped_key/);
  const validityIndex = csv.split('\r\n')[0].split(',').indexOf('valid_resoponse');
  assert.ok(validityIndex >= 0);
  assert.equal(csv.split('\r\n')[1].split(',')[validityIndex], '"0"');
  assert.match(csv, /""""/);
  assert.equal(ResultExporter.cell(null), '');
  assert.equal(ResultExporter.cell('=1+1'), '"\'=1+1"');
});

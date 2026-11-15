import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { StudyConfig } from '../../src/StudyConfig.js';
import { TrialPlanner } from '../../src/TrialPlanner.js';

const baseline = JSON.parse(await readFile(new URL('../../config/study.json', import.meta.url)));

test('both historical protocols have 480 trials and the specified block sequences', () => {
  const config = StudyConfig.validate(baseline);
  for (const condition of ['implicit', 'explicit']) {
    const plan = new TrialPlanner(config, condition, 123).build();
    assert.equal(plan.length, 480);
    for (const block of [1, 2, 3, 5]) {
      const trials = plan.filter(item => item.block === block);
      assert.equal(trials.length, 96);
      assert.deepEqual(trials.map(item => item.target), Array(12).fill(config.conditions[condition].sequence).flat());
    }
    assert.equal(plan.filter(item => item.block === 4).length, 96);
  }
});

test('random block is reproducible, avoids repeats and draws from all positions', () => {
  const config = StudyConfig.validate(baseline);
  const a = new TrialPlanner(config, 'implicit', 404).build();
  assert.deepEqual(a, new TrialPlanner(config, 'implicit', 404).build());
  assert.notDeepEqual(a, new TrialPlanner(config, 'implicit', 405).build());
  const random = a.filter(item => item.block === 4);
  assert.equal(new Set(random.map(item => item.target)).size, 4);
  assert.notEqual(random[0].target, a[287].target);
  random.slice(1).forEach((item, index) => assert.notEqual(item.target, random[index].target));
});

test('random sampling is independent of the sequence contents', () => {
  const config = structuredClone(baseline);
  config.conditions.implicit.sequence = [1, 1, 1, 1];
  config.blocks = [{ type: 'random', trials: 200 }];
  const plan = new TrialPlanner(StudyConfig.validate(config), 'implicit', 10).build();
  assert.equal(new Set(plan.map(item => item.target)).size, 4);
});

test('practice is identified separately and does not consume study trials', () => {
  const config = structuredClone(baseline);
  config.practice.trials = 10;
  const plan = new TrialPlanner(StudyConfig.validate(config), 'explicit', 0).build();
  assert.equal(plan.length, 490);
  assert.ok(plan.slice(0, 10).every(trial => trial.practice && trial.block === 0));
  assert.equal(plan[10].block, 1);
  assert.equal(plan[10].target, 4);
});

test('configuration rejects errors and unsupported options', () => {
  const invalid = [
    c => c.timimg = {},
    c => c.timing.feedbackDurationMs = 501,
    c => c.positions[1].keyCode = c.positions[0].keyCode,
    c => c.conditions.implicit.sequence = [99],
    c => c.blocks[0].repetitions = -1,
    c => c.feedback.sound = true,
    c => c.randomization.balancePositionCounts = true,
    c => c.timing.responseDeadlineMs = 0,
    c => c.blocks = null,
    c => c.conditions = null,
  ];
  for (const mutate of invalid) {
    const config = structuredClone(baseline);
    mutate(config);
    assert.throws(() => StudyConfig.validate(config));
  }
});

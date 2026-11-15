import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BlockSummary } from '../../src/BlockSummary.js';

test('block feedback counts catches and escapes only in the completed block', () => {
  const trials = [
    { block: 0, outcome: 'response', correct: true },
    { block: 1, outcome: 'response', correct: true },
    { block: 1, outcome: 'response', correct: true },
    { block: 1, outcome: 'response', correct: false },
    { block: 1, outcome: 'timeout', correct: false },
    { block: 1, outcome: 'response', correct: true, interrupted: true },
    { block: 2, outcome: 'response', correct: true },
  ];
  assert.deepEqual(BlockSummary.fromTrials(trials, 1), { block: 1, caught: 2, escaped: 2, total: 4 });
  assert.deepEqual(BlockSummary.fromTrials(trials, 0), { block: 0, caught: 1, escaped: 0, total: 1 });
});

test('empty and all-correct blocks have honest zero counts', () => {
  assert.deepEqual(BlockSummary.fromTrials([], 1), { block: 1, caught: 0, escaped: 0, total: 0 });
  const trials = Array.from({ length: 96 }, () => ({ block: 1, outcome: 'response', correct: true }));
  assert.deepEqual(BlockSummary.fromTrials(trials, 1), { block: 1, caught: 96, escaped: 0, total: 96 });
});

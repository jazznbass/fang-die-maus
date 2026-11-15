import { RandomGenerator } from './RandomGenerator.js';

/** Plans all trials before the task starts. Has no browser or jsPsych dependency. */
export class TrialPlanner {
  constructor(config, condition, seed) {
    this.config = config;
    this.condition = condition;
    this.random = new RandomGenerator(seed);
  }

  build() {
    const { config } = this;
    const sequence = config.conditions[this.condition].sequence;
    const blocks = config.practice.trials > 0
      ? [{ type: 'random', trials: config.practice.trials, practice: true }, ...config.blocks]
      : config.blocks;
    const plan = [];
    let previous = null;
    let studyBlock = 0;
    for (const block of blocks) {
      if (!block.practice) studyBlock++;
      const blockNumber = block.practice ? 0 : studyBlock;
      if (!config.randomization.avoidRepeatAcrossBlockBoundary) previous = null;
      const length = block.type === 'sequence' ? block.repetitions * sequence.length : block.trials;
      for (let index = 0; index < length; index++) {
        const position = block.type === 'sequence'
          ? sequence[index % sequence.length] : this.randomPosition(previous);
        plan.push({
          trialNumber: plan.length + 1,
          block: blockNumber,
          trialInBlock: index + 1,
          blockType: block.type,
          practice: Boolean(block.practice),
          sequencePosition: block.type === 'sequence' ? index % sequence.length + 1 : null,
          target: position,
          expectedKey: config.positions.find(item => item.id === position).keyCode,
        });
        previous = position;
      }
    }
    return plan;
  }

  randomPosition(previous) {
    const eligible = this.config.positions.map(item => item.id).filter(id =>
      this.config.randomization.allowImmediateRepeats || id !== previous);
    if (!eligible.length) throw new Error('Randomization has no eligible position.');
    return this.random.choose(eligible);
  }
}

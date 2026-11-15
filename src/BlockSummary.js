/** Counts outcomes from the completed block only, never from future planned trials. */
export class BlockSummary {
  static fromTrials(trials, block) {
    const completed = trials.filter(trial => trial.block === block && !trial.interrupted);
    const caught = completed.filter(trial => trial.outcome === 'response' && trial.correct === true).length;
    const escaped = completed.filter(trial => trial.outcome === 'timeout' ||
      trial.outcome === 'response' && trial.correct === false).length;
    return { block, caught, escaped, total: caught + escaped };
  }
}

/** Reject misspelled settings instead of silently changing an experiment. */
export function checkShape(value, shape, path = 'config') {
  if (typeof shape === 'string') {
    const valid = shape === 'nullableNumber'
      ? value === null || typeof value === 'number' : typeof value === shape;
    if (!valid) throw new Error(`${path}: Bitte einen gültigen Wert angeben (${shape}).`);
    return;
  }
  if (Array.isArray(shape)) {
    if (!Array.isArray(value)) throw new Error(`${path}: Hier muss eine Liste stehen.`);
    value.forEach((item, index) => checkShape(item, shape[0], `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${path}: Hier müssen zusammengehörige Einstellungen stehen.`);
  }
  for (const key of Object.keys(value)) {
    if (!Object.hasOwn(shape, key)) throw new Error(`${path}.${key}: Diese Einstellung ist nicht bekannt.`);
  }
  for (const [key, child] of Object.entries(shape)) checkShape(value[key], child, `${path}.${key}`);
}

export const configShape = {
  configVersion: 'number', studyId: 'string', status: 'string', defaultCondition: 'string',
  positions: [{ id: 'number', color: 'string', keyCode: 'string', keyLabel: 'string' }],
  // Conditions and block variants have their own validation in StudyConfig.
  conditions: 'object', blocks: 'object',
  sequence: { start: 'string' },
  randomization: { seed: 'nullableNumber', sampling: 'string', allowImmediateRepeats: 'boolean',
    avoidRepeatAcrossBlockBoundary: 'boolean', balancePositionCounts: 'boolean' },
  timing: { responseToNextStimulusMs: 'number', feedbackDurationMs: 'number', responseDeadlineMs: 'nullableNumber' },
  response: { wrongMappedKey: 'string', unmappedKey: 'string', earlyKeypress: 'string',
    requireKeyReleaseBeforeResponse: 'boolean', ignoreAutoRepeat: 'boolean' },
  feedback: { visual: 'boolean', text: 'boolean', sound: 'boolean' },
  practice: { trials: 'number' },
  breaks: { betweenBlocks: 'boolean', continueWith: 'string', showSummary: 'boolean' },
  instructions: { caughtExample: 'string', escapedExample: 'string', outcomesContinue: 'string', title: 'string', story: 'string', storyAction: 'string', controlsTitle: 'string', controlsAction: 'string', questions: 'string', nextPage: 'string', extraTitle: 'string', language: 'string', general: 'string', break: 'string', end: 'string', blockEncouragement: 'string', invalidKey: 'string', invalidKeyContinue: 'string', ready: 'string', readyContinue: 'string' },
  presentation: { theme: 'string', showKeyLabels: 'boolean', requestFullscreen: 'boolean', backgroundColor: 'string' },
  qualityControl: { onFocusLoss: 'string' },
  output: { trialFormat: 'string', saveSessionJson: 'boolean', saveResolvedConfig: 'boolean' },
};

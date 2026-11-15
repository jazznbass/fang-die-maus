import { checkShape, configShape } from './ConfigShape.js';

/** Validates both syntax and the features this version actually implements. */
export class StudyConfig {
  static async load(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Die Einstellungen konnten nicht geladen werden: ${path}`);
    return this.validate(await response.json());
  }

  static validate(config) {
    config = structuredClone(config);
    if (config?.presentation && !Object.hasOwn(config.presentation, 'backgroundColor')) {
      config.presentation.backgroundColor = '#FFCE25';
    }
    // New optional presentation settings also work with earlier configuration files.
    if (config?.breaks && !Object.hasOwn(config.breaks, 'showSummary')) config.breaks.showSummary = true;
    if (config?.instructions && !Object.hasOwn(config.instructions, 'blockEncouragement')) {
      config.instructions.blockEncouragement = 'Weiter so! Fang auch in der nächsten Runde die Mäuse.';
    }
    if (config?.instructions && !Object.hasOwn(config.instructions, 'invalidKey')) {
      config.instructions.invalidKey = '⚠️ Das war keine der vier farbigen Tasten!\nLeg deine Finger auf diese Tasten:';
    }
    if (config?.instructions && !Object.hasOwn(config.instructions, 'invalidKeyContinue')) {
      config.instructions.invalidKeyContinue = 'Drück eine Taste um weiterzumachen.';
    }
    if (config?.instructions) {
      config.instructions.ready ??= 'Leg die Finger auf die Tasten';
      config.instructions.readyContinue ??= 'Drücke eine Taste um zu starten';
    }
    if (config?.instructions) {
      config.instructions.title ??= "Fang die Maus!";
      config.instructions.story ??= "Die Maus will den Käse klauen.\nSie kommt aus einem von vier Löchern.";
      config.instructions.storyAction ??= "Fang die Maus und rette den Käse!";
      config.instructions.controlsTitle ??= "So fängst du die Maus";
      config.instructions.controlsAction ??= "";
      config.instructions.questions ??= "Drücke eine Taste.";
      config.instructions.nextPage ??= "Drücke eine Taste, um weiterzugehen.";
      config.instructions.extraTitle ??= "Noch ein Hinweis";
    }
    if (config?.instructions) {
      config.instructions.caughtExample ??= "Wenn du die richtige Taste drückst, fängst du die Maus:";
      config.instructions.escapedExample ??= "Bist du zu langsam, entkommt die Maus:";
      config.instructions.outcomesContinue ??= "Alles klar? Drücke eine Taste.";
    }
    checkShape(config, configShape);
    const require = (valid, message) => { if (!valid) throw new Error(message); };
    const whole = (value, minimum = 0) => Number.isSafeInteger(value) && value >= minimum;
    require(config.configVersion === 1, 'Diese Version der Einstellungen wird nicht unterstützt.');
    require(/^[a-zA-Z0-9_-]+$/.test(config.studyId), 'studyId darf nur Buchstaben, Zahlen, _ oder - enthalten.');
    require(config.positions.length >= 2 && config.positions.length <= 8, 'Bitte 2 bis 8 Positionen einstellen.');
    const ids = config.positions.map(position => position.id);
    const keys = config.positions.map(position => position.keyCode);
    require(ids.every(id => whole(id, 1)) && new Set(ids).size === ids.length, 'Jede Position braucht eine eigene ganze Zahl größer als 0.');
    require(new Set(keys).size === keys.length, 'Jede Position braucht eine eigene Taste.');
    require(keys.every(key => /^(Key[A-Z]|Digit[0-9]|Comma|Period|Slash|Semicolon|Quote|BracketLeft|BracketRight|Backslash|Minus|Equal|ArrowLeft|ArrowRight|ArrowUp|ArrowDown)$/.test(key)), 'Diese Taste wird nicht unterstützt.');
    require(config.positions.every(item => /^#[0-9a-f]{6}$/i.test(item.color)), 'Farben müssen im Format #RRGGBB stehen.');
    require(/^#[0-9a-f]{6}$/i.test(config.presentation.backgroundColor), 'Die Hintergrundfarbe muss im Format #RRGGBB stehen.');
    require(config.conditions && !Array.isArray(config.conditions), 'Die Varianten müssen unter conditions zusammengefasst sein.');
    require(Object.hasOwn(config.conditions, config.defaultCondition), 'Die gewählte Standardvariante fehlt.');
    for (const [name, condition] of Object.entries(config.conditions)) {
      require(/^[a-zA-Z0-9_-]+$/.test(name), 'Namen der Varianten dürfen nur Buchstaben, Zahlen, _ oder - enthalten.');
      checkShape(condition, { sequence: ['number'], additionalInstruction: 'string' }, name);
      require(condition.sequence.length > 0 && condition.sequence.every(id => ids.includes(id)), `${name}: Die Reihenfolge enthält ungültige Positionen.`);
    }
    require(Array.isArray(config.blocks) && config.blocks.length > 0, 'Mindestens eine Runde ist nötig.');
    for (const block of config.blocks) {
      require(block && ['sequence', 'random'].includes(block.type), 'Diese Art von Runde ist nicht bekannt.');
      const field = block.type === 'sequence' ? 'repetitions' : 'trials';
      checkShape(block, { type: 'string', [field]: 'number' }, 'block');
      require(whole(block[field], 1), `block.${field} muss eine ganze Zahl größer als 0 sein.`);
    }
    for (const [name, value] of Object.entries(config.timing)) {
      require(name === 'responseDeadlineMs' && value === null || whole(value), `${name} muss eine ganze Zahl ab 0 sein. Nur erlaubte Werte dürfen null sein.`);
    }
    require(config.timing.responseDeadlineMs === null || config.timing.responseDeadlineMs > 0, 'Die Zeit zum Antworten muss größer als 0 sein.');
    require(config.timing.feedbackDurationMs <= config.timing.responseToNextStimulusMs, 'Die Rückmeldung darf nicht länger dauern als die Zeit bis zur nächsten Maus.');
    require(whole(config.practice.trials), 'Die Zahl der Übungsversuche muss eine ganze Zahl ab 0 sein.');
    for (const condition of Object.values(config.conditions)) {
      const total = config.practice.trials + config.blocks.reduce((sum, block) => sum +
        (block.type === 'sequence' ? block.repetitions * condition.sequence.length : block.trials), 0);
      require(total <= 100000, 'Ein Test darf höchstens 100.000 Versuche enthalten.');
    }
    const seed = config.randomization.seed;
    require(seed === null || whole(seed) && seed <= 0xffffffff, 'Der Startwert für den Zufall muss null oder eine ganze Zahl von 0 bis 4294967295 sein.');
    // Unsupported options fail explicitly; they can be added without ambiguous defaults.
    for (const [name, actual, supported] of [
      ['sequence.start', config.sequence.start, 'first_item_each_block'],
      ['randomization.sampling', config.randomization.sampling, 'uniform_over_allowed_positions'],
      ['balancePositionCounts', config.randomization.balancePositionCounts, false],
      ['wrongMappedKey', config.response.wrongMappedKey, 'end_trial'],
      ['unmappedKey', config.response.unmappedKey, 'warn_and_repeat'],
      ['earlyKeypress', config.response.earlyKeypress, 'ignore_and_log'],
      ['requireKeyReleaseBeforeResponse', config.response.requireKeyReleaseBeforeResponse, true],
      ['ignoreAutoRepeat', config.response.ignoreAutoRepeat, true],
      ['feedback.sound', config.feedback.sound, false],
      ['breaks.continueWith', config.breaks.continueWith, 'ANY_KEY'],
      ['presentation.theme', config.presentation.theme, 'mice'],
      ['onFocusLoss', config.qualityControl.onFocusLoss, 'interrupt_and_flag_trial'],
      ['trialFormat', config.output.trialFormat, 'csv'],
      ['saveSessionJson', config.output.saveSessionJson, true],
      ['saveResolvedConfig', config.output.saveResolvedConfig, true],
    ]) require(actual === supported, `${name}: Diese Version unterstützt nur ${JSON.stringify(supported)}.`);
    return structuredClone(config);
  }
}

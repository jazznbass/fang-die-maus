/** Exports raw observations, including errors, practice and interrupted trials. */
export class ResultExporter {
  static csv(session) {
    const columns = ['participantId', 'sessionId', 'condition', 'seed', 'trialNumber', 'block',
      'trialInBlock', 'blockType', 'practice', 'sequencePosition', 'target', 'expectedKey',
      'responseCode', 'responseKey', 'correct', 'valid_resoponse', 'outcome', 'rtMs', 'onsetTimestampMs',
      'responseTimestampMs', 'timeoutTimestampMs', 'previousIntervalAnchor',
      'intervalFromPreviousResponseMs', 'feedbackOnsetTimestampMs',
      'feedbackOffsetTimestampMs', 'interrupted', 'interruptionReason', 'stimulusOnsetsMs', 'inputEvents'];
    const rows = session.trials.map(trial => ({ participantId: session.participantId,
      sessionId: session.id, condition: session.condition, seed: session.seed, ...trial }));
    return [columns.join(','), ...rows.map(row => columns.map(key => this.cell(row[key])).join(','))].join('\r\n');
  }

  static cell(value) {
    if (value === null || value === undefined) return '';
    let text = typeof value === 'object' ? JSON.stringify(value) : String(value);
    // Prevent spreadsheet formula interpretation of arbitrary text responses.
    if (typeof value === 'string' && /^[=+@-]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  }

  static download(session, format) {
    const text = format === 'csv' ? this.csv(session) : JSON.stringify(session, null, 2);
    const blob = new Blob([text], { type: format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${session.config.studyId}_${session.participantId}_${session.id}.${format}`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

/** German labels for technical values. Saved identifiers remain stable for analysis. */
export class UiText {
  static count(number, singular, plural) {
    return `${number} ${number === 1 ? singular : plural}`;
  }

  static condition(name) {
    return { implicit: 'Variante 1', explicit: 'Variante 2' }[name] ?? name;
  }

  static stopReason(reason) {
    const reasons = {
      operator_escape: 'Die Taste Esc wurde gedrückt.',
      focus_lost: 'Das Spielfenster wurde verlassen.',
      tab_hidden: 'Eine andere Seite wurde geöffnet.',
      not_focused_at_trial_start: 'Das Spielfenster war nicht aktiv.',
    };
    if (reasons[reason]) return reasons[reason];
    if (reason?.startsWith('local_save_failed')) return 'Die Ergebnisse konnten nicht im Browser gespeichert werden.';
    return 'Ein technischer Fehler ist aufgetreten.';
  }

  static error(error) {
    if (error instanceof SyntaxError) return 'Die Datei konnte nicht gelesen werden. Bitte das JSON-Format prüfen.';
    if (error instanceof TypeError || error instanceof DOMException) {
      return 'Das Spiel konnte nicht geladen oder gespeichert werden. Bitte die Testleitung um Hilfe bitten.';
    }
    return error.message;
  }
}

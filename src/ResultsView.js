import { ResultExporter } from './ResultExporter.js';
import { UiText } from './UiText.js';

/** Downloads remain explicit so the browser cannot silently block multiple files. */
export class ResultsView {
  static show(element, session) {
    element.innerHTML = `<section class="card results"><p class="eyebrow">MÄUSE FANGEN</p>
      <h1></h1><p class="end-message"></p>
      <details class="operator-results"><summary>Ergebnisse speichern · Für die Testleitung</summary>
      <p class="summary"></p><p class="reason"></p>
      <div class="actions"><button id="download-csv">Ergebnisse speichern (CSV)</button>
      <button id="download-json" class="secondary">Alle Daten speichern (JSON)</button></div>
      <p class="muted">Bitte beide Dateien speichern, bevor das Fenster geschlossen wird.</p>
      <p class="save-status"></p><button id="another-session" class="text-button">Zurück zur Vorbereitung</button></details></section>`;
    element.querySelector('h1').textContent = session.status === 'completed' ? 'Geschafft!' : 'Das Spiel wurde beendet.';
    element.querySelector('.end-message').textContent = session.status === 'completed'
      ? session.config.instructions.end : 'Bitte melde dich bei der Testleitung.';
    element.querySelector('.summary').textContent = `${session.participantId} · ${UiText.condition(session.condition)} · ${session.trials.length} von ${session.plan.length} Versuchen gespeichert.`;
    element.querySelector('.reason').textContent = session.stopReason
      ? `${UiText.stopReason(session.stopReason)} Die bisherigen Ergebnisse bleiben erhalten. Dieser Test wird nicht fortgesetzt.` : '';
    element.querySelector('.save-status').textContent = session.saveError
      ? 'Die Kopie im Browser konnte nicht gespeichert werden. Bitte die Ergebnisse jetzt herunterladen.'
      : 'Eine Kopie der Ergebnisse liegt auch in diesem Browser.';
    element.querySelector('#download-csv').onclick = () => ResultExporter.download(session, 'csv');
    element.querySelector('#download-json').onclick = () => ResultExporter.download(session, 'json');
    element.querySelector('#another-session').onclick = () => location.reload();
  }
}

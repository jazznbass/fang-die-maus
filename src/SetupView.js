import { StudyConfig } from './StudyConfig.js';
import { TrialPlanner } from './TrialPlanner.js';
import { ResultExporter } from './ResultExporter.js';
import { UiText } from './UiText.js';
import { Appearance } from './Appearance.js';

/** Experimenter controls are kept outside the participant task. */
export class SetupView {
  constructor(element, store, onStart) {
    Object.assign(this, { element, store, onStart });
  }

  async mount() {
    this.element.innerHTML = `<section class="setup card">
      <h1>Fang die Maus!</h1><p class="intro">VORBEREITUNG · FÜR DIE TESTLEITUNG</p>
      <form><label>Einstellungen<select id="configuration"><option value="demo">Demo Test</option><option value="study">Ganzer Test</option><option value="custom">Eigene Datei laden …</option></select></label>
      <label id="file-label" class="file-picker" hidden>Datei mit Einstellungen
      <input id="config-file" type="file" accept=".json,application/json">
      <span class="file-picker-button">Datei auswählen</span><span id="selected-file">Keine Datei ausgewählt</span></label>
      <div class="form-row"><label>Code der Person<input id="participant" required pattern="[A-Za-z0-9_-]+" maxlength="64" placeholder="z. B. P001" autocomplete="off"></label>
      <label>Bedingung<select id="condition"></select></label></div>
      <p id="config-summary" class="config-summary"></p>
      <p id="setup-error" role="alert"></p><button id="start" type="submit">Test starten</button></form>
      <p class="prototype-note">Testversion: Vor der Studie bitte die Einstellungen und die Zeitmessung prüfen.</p>
      <details><summary>Frühere Ergebnisse öffnen</summary><p class="muted">Hier liegen Kopien früherer Ergebnisse. Bitte die Dateien herunterladen und aufbewahren.</p><div id="recovery"></div></details></section>`;
    this.element.querySelector('#configuration').onchange = () => this.loadSelection();
    this.element.querySelector('#condition').onchange = () => this.describe();
    this.element.querySelector('#config-file').onchange = event => this.loadFile(event.target.files[0]);
    this.element.querySelector('form').onsubmit = async event => {
      event.preventDefault();
      const button = this.element.querySelector('#start');
      button.disabled = true;
      try {
        await this.onStart(this.config, this.element.querySelector('#participant').value,
          this.element.querySelector('#condition').value);
      } catch (error) { this.error(error); button.disabled = false; }
    };
    this.showRecovery();
    await this.loadSelection();
  }

  async loadSelection() {
    const request = this.loadRequest = (this.loadRequest ?? 0) + 1;
    const name = this.element.querySelector('#configuration').value;
    this.element.querySelector('#file-label').hidden = name !== 'custom';
    this.config = null;
    this.element.querySelector('#start').disabled = true;
    this.element.querySelector('#config-summary').textContent = '';
    if (name === 'custom') return;
    try {
      const config = await StudyConfig.load(`config/${name}.json`);
      if (request === this.loadRequest) this.setConfig(config);
    } catch (error) { if (request === this.loadRequest) this.error(error); }
  }

  async loadFile(file) {
    this.element.querySelector('#selected-file').textContent = file?.name ?? 'Keine Datei ausgewählt';
    const request = this.loadRequest = (this.loadRequest ?? 0) + 1;
    this.config = null;
    this.element.querySelector('#start').disabled = true;
    if (!file) return;
    try {
      const config = StudyConfig.validate(JSON.parse(await file.text()));
      if (request === this.loadRequest) this.setConfig(config);
    } catch (error) { if (request === this.loadRequest) this.error(error); }
  }

  setConfig(config) {
    this.config = config;
    Appearance.apply(config);
    const select = this.element.querySelector('#condition');
    select.replaceChildren(...Object.keys(config.conditions).map(name => new Option(UiText.condition(name), name)));
    select.value = config.defaultCondition;
    this.element.querySelector('#setup-error').textContent = '';
    this.element.querySelector('#start').disabled = false;
    this.describe();
  }

  describe() {
    if (!this.config) return;
    const condition = this.element.querySelector('#condition').value;
    const trials = new TrialPlanner(this.config, condition, 1).build();
    this.element.querySelector('#config-summary').textContent = [
      UiText.count(this.config.blocks.length, 'Runde', 'Runden'),
      UiText.count(trials.filter(t => !t.practice).length, 'Maus', 'Mäuse'),
      `${UiText.count(this.config.practice.trials, 'Maus', 'Mäuse')} zum Üben`,
      `${this.config.timing.responseToNextStimulusMs} ms bis zur nächsten Maus`,
    ].join(' · ');
  }

  showRecovery() {
    const list = this.element.querySelector('#recovery');
    try {
      for (const session of this.store.list()) {
        const row = document.createElement('p');
        row.textContent = `${session.participantId} · ${UiText.condition(session.condition)} · ${new Date(session.startedAt).toLocaleString('de-DE')} · ${UiText.count(session.trials.length, 'Versuch', 'Versuche')} `;
        for (const format of ['csv', 'json']) {
          const button = document.createElement('button');
          button.className = 'text-button';
          button.textContent = format.toUpperCase();
          button.onclick = () => ResultExporter.download(session, format);
          row.append(button);
        }
        list.append(row);
      }
      if (!list.children.length) list.textContent = 'Hier sind noch keine Ergebnisse gespeichert.';
    } catch (error) { this.error(error); }
  }

  error(error) { this.element.querySelector('#setup-error').textContent = UiText.error(error); }
}

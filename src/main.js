import { Experiment } from './Experiment.js';
import { SetupView } from './SetupView.js';
import { SessionStore } from './SessionStore.js';
import { ResultsView } from './ResultsView.js';
import { UiText } from './UiText.js';

const element = document.querySelector('#experiment');
const store = new SessionStore();
let sessionRunning = false;

window.addEventListener('beforeunload', event => {
  if (sessionRunning) { event.preventDefault(); event.returnValue = ''; }
});

const setup = new SetupView(element, store, async (config, participantId, condition) => {
  if (config.presentation.requestFullscreen && !document.fullscreenElement) {
    try { await document.documentElement.requestFullscreen(); }
    catch { /* Continue windowed; actual fullscreen status is saved below. */ }
  }
  const experiment = new Experiment(config, participantId, condition, store);
  experiment.session.environment.fullscreen = Boolean(document.fullscreenElement);
  sessionRunning = true;
  try {
    const session = await experiment.run();
    ResultsView.show(element, session);
  } finally {
    sessionRunning = false;
    if (document.fullscreenElement) await document.exitFullscreen();
  }
});

setup.mount().catch(error => { element.textContent = `Das Spiel startet nicht. ${UiText.error(error)}`; });

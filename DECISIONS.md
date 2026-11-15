# SRT program decisions

Last updated: 2026-11-13

This document records the decisions agreed with the researcher. It separates
accepted software decisions from historical study parameters and provisional
defaults. Acceptance of the architecture does not finalize the study protocol.

## 1. Purpose and scope — agreed

- Rebuild the original serial reaction time (SRT) program as a reusable paradigm.
- Use the supplied C++ code, added `Bibliotheken` folder, study description and
  figure to understand the original task.
- Begin with the described four-position mouse task and its implicit and explicit
  conditions. Study changes are likely, but none have been specified yet.
- Keep study settings in an editable text configuration file so later changes
  to sequences, blocks, keys, timing and instructions do not require editing the
  task engine. The initial format is JSON: `config/study.json`.
- Preserve the original source material as reference.

## 2. Platform and framework — agreed

- Build a locally running browser application using JavaScript.
- Keep dependencies and assets local so the experiment can run without internet
  access, served through localhost.
- Use a hybrid architecture: jsPsych for experiment infrastructure and our own
  small SRT plugin for the task-specific behavior.
- Use jsPsych for the timeline, standard screens, data utilities and suitable
  plugin utilities. Our code handles trial planning, mouse presentation and the
  explicitly defined response rules.
- Implement a custom plugin through jsPsych's supported interfaces rather than
  extensively modifying the standard SRT plugin or rebuilding the entire
  experiment framework from scratch.
- Java was discussed as a fallback, but is not the selected implementation.

Rationale: jsPsych already provides a conventional keyboard SRT plugin, but its
documented grid presentation and feedback options do not cover all of our mouse
graphics, physical-key mapping and premature-response requirements. Its
`serial-reaction-time-mouse` plugin means pointing-device responses, not animal
stimuli. Custom JavaScript class-based plugins are supported by jsPsych.

## 3. Readability and organization — agreed

The researcher must be able to understand and modify the code.

- Use objects and plain JavaScript classes and modules across multiple files.
- Give each class a clear main responsibility; avoid huge files and methods.
- Use descriptive names and explicit units, such as `feedbackDurationMs`.
- Explain experimental decisions in comments and document inputs and outputs.
- Keep configuration, trial planning, trial execution, presentation, input
  handling and export separate.
- Avoid a complicated inheritance hierarchy or an additional large application
  framework. Reuse objects through simple composition where appropriate.
- Keep third-party dependencies separate from our readable application source.

The accepted initial organization is below. Exact filenames can evolve while
preserving these responsibilities.

```text
config/
  study.json
src/
  main.js                 Application entry point
  Experiment.js           Session coordination and jsPsych timeline
  StudyConfig.js          Configuration loading and validation
  TrialPlanner.js         Sequence and random-block trial planning
  SrtPlugin.js            Adapter between an SRT trial and jsPsych
  SrtTrial.js             Stimulus, response and feedback lifecycle
  MouseDisplay.js         Holes, mice and feedback presentation
  ResponseCollector.js   Keyboard handling and response rules
  ResultExporter.js      Results and session settings export
styles/
  experiment.css
vendor/
  ...local jsPsych dependencies...
```

## 4. Timing — agreed engineering direction

- Reaction time ends at the accepted response, before feedback or waiting.
- Define response-to-next-stimulus timing explicitly, including whether feedback
  is part of that interval. The draft includes feedback in the total interval.
- Preload assets, use monotonic timing and coordinate drawing with display frames.
- Test custom timing and keyboard behavior; jsPsych does not automatically
  validate the timing of a custom plugin.
- Validate the finished task on the intended browser, computer, display and
  keyboard before collecting study data. Local execution does not eliminate
  hardware latency, and software timestamps do not measure physical screen onset.
- Do not promise millisecond physical accuracy based on timestamp resolution.

## 5. Historical protocol — starting reference, not a fixed future design

The supplied description specifies:

| Setting | Historical description |
| --- | --- |
| Positions | Four, ordered red, green, blue, yellow in the figure |
| Task | Press the key corresponding to the mouse's hole, quickly and accurately |
| Feedback | Correct response catches the mouse; incorrect response lets it escape and eat cheese |
| Implicit sequence | 1–3–4–2–3–1–2–4 |
| Explicit sequence | 4–2–1–3–2–4–3–1 |
| Blocks 1–3 and 5 | Eight-item sequence repeated 12 times: 96 trials per block |
| Block 4 | 96 random trials |
| Total | 480 trials per condition |
| Response-to-next-stimulus interval | 500 ms |
| Explicit instruction | Informs participants that the mice appear in a regular order |
| Administration | Implicit and explicit tasks on separate days |

The new configuration represents both conditions. It does not yet implement
day scheduling or condition assignment/counterbalancing.

## 6. Provisional settings — not finalized by the researcher

The current JSON is a concrete draft, not proof of the original settings or a
final study protocol. These defaults remain changeable:

- Physical key mapping inferred from the figure: Y, X, M, comma on German QWERTZ.
- 400 ms feedback within a total 500 ms response-to-next-stimulus interval.
- No response deadline; no practice trials; self-paced breaks between blocks.
- Start each sequence block at its first item.
- Random trials sample uniformly from eligible positions, without immediate
  repeats, including across the preceding block boundary; equal position counts
  are not enforced.
- Original implementation (superseded for unmapped keys on 2026-11-15):
  Wrong mapped keys end a trial. Unmapped and premature keys are logged but
  do not answer a trial or shorten the waiting interval.
- Require release of a previously held key; ignore automatic key repeat.
- Visual feedback, no sound or textual feedback, and no on-screen key labels.
- English draft instructions and a fullscreen request.
- Interrupt and flag trials on focus loss; the resume policy remains open.
- One condition per session, with implicit as the initial selection default.
- Trial CSV plus session JSON with the resolved configuration and reproducibility
  information. The exact export schema and local saving/recovery mechanism remain
  to be implemented.

The researcher currently has no additional original instructions or procedure
details available. This does not block building a configurable implementation.

## 7. Legacy findings relevant to implementation

- `cpp-code/main.cpp` is a six-position endless demo, not the five-block study
  controller described in the study text.
- The added `Bibliotheken/srt.h` and `srt.cpp` supply the task class used by that
  main program. `edl_srt.cpp` is an alternative implementation.
- In the added `srt.cpp`, ordinary RT is recorded immediately after the response,
  before feedback/waiting. The RT issue found in the older `srt.~cp` backup does
  not apply to this implementation.
- Defaults of 400 ms feedback and 100 ms RSI are compatible with the described
  500 ms total, but do not establish the actual study's configuration.
- Legacy early responses can shorten the interval and carry over as negative
  RTs for the next trial. The new draft deliberately does not copy that behavior.
- Legacy randomization avoids immediate repeats, but samples from part of the
  sequence string rather than directly from all configured positions. The new
  planner should sample eligible positions directly.

## 8. Current status and open implementation details

Version 0.1.0 is now implemented. jsPsych 8.3.0 and its html-button-response
plugin 2.1.0 are pinned and stored locally. Our source is split into small classes
and modules. A localhost server, macOS/Windows launch scripts, demo configuration,
configuration loading, trial execution, local recovery, CSV and JSON exports are
available. See README.md and CODE-GUIDE.md for usage and structure.

Implementation choices made within the agreed architecture (still open to study
refinement): focus loss or Escape stops the session rather than resuming; local
browser recovery is saved after each finished trial; result downloads are explicit;
practice trials are a separate random block; deadlines produce missing responses
and RTs with separate timeout timestamps. The demo has 24 trials and visible key
labels. Existing artwork is reused with CSS feedback and an initial cheese emoji.

Twelve automated tests and browser checks are documented in
outputs/verification/VERIFICATION.md. Hardware timing, standalone browser focus
handling, other operating systems and final scientific settings remain to be
validated before data collection.

## References

- Original description: `../test-description/test-description.md`
- Original figure: `../test-description/figure1.png`
- Legacy source: `../cpp-code/Bibliotheken/srt.h` and `srt.cpp`
- [jsPsych SRT plugin](https://www.jspsych.org/latest/plugins/serial-reaction-time/)
- [jsPsych pointing-device SRT plugin](https://www.jspsych.org/latest/plugins/serial-reaction-time-mouse/)
- [jsPsych custom plugin development](https://www.jspsych.org/latest/developers/plugin-development/)
- [jsPsych timing documentation](https://www.jspsych.org/latest/overview/timing-accuracy/)

## Decision history

- **2026-11-13:** Agreed on a configurable, readable, object-based local browser
  implementation using jsPsych plus our own SRT plugin. Created this record at
  the researcher's request. Future agreed changes should be dated here and
  reflected in the relevant sections above.

- **2026-11-13 (implementation):** At the researcher's instruction to start
  programming, built the first local browser version within the agreed
  architecture. Added a reading guide and configuration reference; documented
  implementation choices and remaining validation separately from finalized
  scientific decisions.

- **2026-11-13 (keyboard breaks):** At the researcher’s request, replace the
  between-block Continue button with “Press any key to start the new block”.
  Use `breaks.continueWith: "ANY_KEY"`. Require a fresh press and prevent the
  continuation key from also answering the next trial. Initial session setup
  and the initial instruction screen remain unchanged.

- **2026-11-13 (motivational block feedback):** At the researcher's request,
  add caught mice in a cage and escaped mice at a large cheese wedge to the
  between-block break. Implementation uses the block just completed, not a
  cumulative total. Correct responses count as caught; incorrect responses and
  timeouts count as escaped; interrupted trials are excluded. Each mouse icon
  represents one trial up to 96 icons per group; longer custom blocks also show
  an explicit remainder. Counts remain exact. Continue with any fresh key.
  `breaks.showSummary` can disable this feedback and
  `instructions.blockEncouragement` controls the motivational text.

- **2026-11-13 (deutsche Oberfläche):** Auf Wunsch des Forschers wird die
  Oberfläche für deutschsprachige Lernende mit Lernschwierigkeiten in einfacher
  Sprache angezeigt. Kurze Sätze, direkte Ansprache mit „du“, größere Textzeilen
  und „Runde“ statt „Block“. Auch Vorbereitung, Rückmeldungen, Fehlermeldungen
  und Speichern sind Deutsch. Technische Funktionen am Ende sind unter einem
  eigenen Bereich für die Testleitung zusammengefasst. Nur Variante 2 erklärt
  die feste Reihenfolge. Interne Bezeichnungen und Exportspalten bleiben stabil.
  Frühere gespeicherte Sitzungen werden nicht verändert. Eigene Konfigurationen
  können weiterhin eigene Texte enthalten; bestehende englische Texte werden
  nicht automatisch übersetzt. Die Texte sind keine zertifizierte Leichte Sprache.

- **2026-11-13 (Grafiküberlagerung):** Auf Wunsch des Forschers wird das
  Käsestück bei einer falschen Antwort groß innerhalb des Kreises über den
  Körper der Maus gelegt. Das kleine Käse-Emoji am Rand entfällt. Die Maus wird
  ohne Farbmischung vor dem Kreis gezeichnet. Dafür wurde mit Imagegen eine
  transparente Ableitung der Originalgrafik erstellt und als eigene PNG-Datei
  gespeichert; das Original bleibt erhalten. Auch die Rundenübersicht verwendet
  die transparente Maus. Die Grafik ist eine modellgestützte Nachbildung, keine
  pixelgenaue Freistellung. Die regulären Zeitparameter bleiben unverändert.

- **2026-11-15 (Hintergrund):** Auf Wunsch des Forschers ist der Hintergrund
  über `presentation.backgroundColor` konfigurierbar. Vorläufiger Standard ist
  der helle Ockerton #E6CF99; der genaue historische Farbwert ist nicht belegt.
  Die Farbe gilt für alle Bildschirme und wird mit der Konfiguration gespeichert.
  Ziellöcher und Bedienelemente behalten ihre eigenen Farben. Ein randloses
  Desktop-Fenster mit integriertem Browser wurde als nächster möglicher Ausbau
  besprochen; eine Electron-App ist zu diesem Zeitpunkt noch nicht umgesetzt.


## 2026-11-15: Hinweis bei nicht zugeordneten Tasten

- Während einer Mausantwort zeigt eine Taste außerhalb der vier Antworttasten
  einen großen deutschen Hinweis zur Fingerposition. Text über `instructions.invalidKey`.
- Bestätigt: Nach einem neuen Tastendruck dieselbe Maus wiederholen und die
  Reaktionszeit sowie eine konfigurierte Antwortfrist neu starten. Der Tastendruck
  zum Weitergehen ist noch keine Antwort. Mehrfache Warnungen sind möglich.
- Eine Zeile pro geplantem Versuch; `valid_resoponse` (gewünschte Schreibweise)
  bleibt nach einer Warnung 0, sonst 1. Falsche zugeordnete Antworten bleiben gültig.
- Alle Anzeigezeitpunkte und Tastendrücke bleiben nachvollziehbar. Eine Warnung
  zählt nicht als zusätzliche gefangene oder entkommene Maus.
- Esc bleibt Abbruch; Fokusverlust unterbricht auch während des Hinweises.
- Neue Konfigurationseinstellung `response.unmappedKey = "warn_and_repeat"`.
  Ältere eigene Dateien müssen diesen Wert ausdrücklich übernehmen.

- Hinweis überarbeitet: „Leg deine Finger auf diese Tasten:“ mit vier farbigen
  Kreisen und Tastenbeschriftungen aus der Konfiguration. Die Aufforderung zum
  Weitergehen steht darunter (`instructions.invalidKeyContinue`).


## 2026-11-15: Vorbereitung und größere Pausenbilder

- Nach „Los geht’s“ folgt ein eigener, zentrierter Bildschirm: „Leg die Finger
  auf die Tasten“, farbige Tastenkreise und „Drücke eine Taste um zu starten“.
- Erst ein frischer Tastendruck startet den ersten Versuch (gegebenenfalls Übung).
  Gehaltene Tasten starten nicht; die Starttaste beantwortet nicht gleichzeitig
  die erste Maus. Esc beendet den Test auch auf diesem Bildschirm.
- Die Texte sind als `instructions.ready` und `instructions.readyContinue`
  konfigurierbar. Fehlende Felder bekommen die deutschen Standardtexte.
- Käse und Käfig haben in der Pause vergleichbare Größe. Die Mäuse sind etwa
  doppelt so groß und liegen über der Käsefläche bzw. hinter den Käfigstäben.
  Die tatsächlichen Anzahlen bleiben unverändert sichtbar.

## 2026-11-15: Kurze Bildanleitung für Kinder

- Zwei große, bildgestützte Anleitungsseiten: Geschichte „Fang die Maus!“ und
  Bedienung mit farbigen Tasten direkt unter den vier Löchern. Keine zusätzliche
  Erklärung zu richtigen/falschen Antworten. Weiter jeweils mit einer frischen Taste.
- Danach bleibt der separate Bildschirm zum Hinlegen der Finger bestehen.
- Bedingungsspezifische Zusatzinstruktionen bleiben erhalten, auf einer eigenen
  Seite nur für Varianten mit entsprechendem Text.
- Hintergrund aus der Vorlage übernommen: #FFCE25. Demo, Studie und Standardwert
  sind angepasst; eigene ausdrücklich gesetzte Hintergrundfarben bleiben gültig.
- Mauselöcher in Anleitung und Aufgabe: schlichte farbige Form, oben rund,
  unten flach. Keine Animationen oder zusätzlichen visuellen Reize.

## 2026-11-15: Bildbeispiele für gefangen und entkommen

- Mehr Abstand unter den Überschriften und um den Rettungsaufruf auf Seite 1.
- Seite 2 endet nach den Tastenbildern nur mit „Drücke eine Taste.“
- Neue dritte Seite zeigt dieselbe Mausposition einmal mit Gitter und einmal
  mit Käse. Texte wie gewünscht: richtige Taste / zu langsam; Abschluss
  „Alles klar? Drücke eine Taste.“ Die letzte Vorbereitungsseite bleibt bestehen.
- Gitter verwendet dieselbe oben runde, unten flache Form wie die Mauselöcher.
- Die Antwortfrist wurde durch diese Instruktionsänderung nicht verändert:
  `responseDeadlineMs` bleibt in den mitgelieferten Konfigurationen null.

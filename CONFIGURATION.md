# Configuration reference — version 1

Use `config/study.json` as the full example. Copy it before changing a study.
JSON requires double quotes and does not allow comments or trailing commas.
The setup screen can load another JSON file without modifying the default files.

## Study structure

| Setting | Meaning |
| --- | --- |
| `configVersion` | Must be `1` |
| `studyId`, `status` | Study identifier and descriptive metadata; status does not validate a study |
| `defaultCondition` | Initial selection on the setup screen, not random assignment |
| `positions` | Ordered array of 2–8 positions with unique IDs, colors, physical key codes and displayed labels |
| `conditions` | Named conditions, each with a nonempty sequence of position IDs and additional instruction text |
| `blocks` | Sequence blocks use `repetitions`; random blocks use `trials` |
| `practice.trials` | Number of initial random practice trials; exported as block 0 with `practice: true` |

One session runs the condition selected by the experimenter. The instruction
screen shows its additional instruction, if any. Sequence blocks restart at
their first item. No day scheduling or counterbalancing is implemented.

Physical key codes are layout independent. `KeyZ` denotes the key labelled Y on
German QWERTZ, or Z on US QWERTY. `keyLabel` is only the displayed label. The
initial mapping is Y, X, M, comma on QWERTZ. Check it on the actual keyboard.
Escape is reserved for stopping the task.

## Timing and responses

| Setting | Meaning |
| --- | --- |
| `responseToNextStimulusMs` | Total nominal interval after a response, including feedback |
| `feedbackDurationMs` | Feedback portion of that total, measured from the response; zero disables feedback |
| `responseDeadlineMs` | Maximum response window; `null` waits indefinitely |
| `feedback.visual`, `feedback.text` | Enable visual and textual feedback separately |

All durations use milliseconds. Visual changes wait for an animation frame:
actual software intervals can exceed requested intervals by a frame or more.
Feedback appears on the first frame after the response and clears on the first
frame at/after the configured feedback endpoint. No positive fade is applied.

The first fresh mapped key ends a trial even when incorrect. Unmapped keys during the response window show a keyboard reminder and repeat
the same target after a fresh continuation key. Early keys are ignored as responses
but logged. Keys held from an earlier phase
must be released before they can answer; automatic repeats are ignored.

A deadline produces a timeout with missing response and RT. The next interval
is anchored to timeout detection. `timeoutTimestampMs` records this separately;
`responseTimestampMs` remains null. `previousIntervalAnchor` identifies whether
`intervalFromPreviousResponseMs` refers to a previous response or a timeout.
Breaks reset the interval anchor, so the next interval measurement is null.

## Randomization

- `seed: null`: generate a new unsigned 32-bit seed and save it with the session.
- Explicit integer seed: reproduce planning for the same config, condition and
  planner version.
- `allowImmediateRepeats: false`: exclude the preceding position when drawing
  a random target.
- `avoidRepeatAcrossBlockBoundary`: apply that exclusion to the preceding block's
  final position too. It does not alter fixed sequence blocks.
- Draw uniformly from eligible position IDs. Counts are not forced equal.

## Presentation and session behavior

- `instructions`: editable general, extra condition, break and end messages.
  The `language` value is descriptive metadata, not automatic translation of
  the whole interface. Setup controls and optional feedback text are German. The bundled
  configurations use short German instructions (`language: "de"`).
- `breaks.betweenBlocks`: self-paced breaks, including after practice. Continue
  with any fresh keypress (`continueWith: "ANY_KEY"`). A held key does not
  dismiss the break, and the continuation key does not answer the next trial.
- `presentation.showKeyLabels`: labels under the holes. The instruction screen
  always teaches the mapping.
- `presentation.requestFullscreen`: request fullscreen when Start is clicked.
  If the browser rejects it, continue windowed and record that fact.
- Focus loss or Escape during a trial stops the session and flags the active
  trial; already recorded responses remain available. Restarting makes a new
  session, rather than repeating the interrupted trial.

## Explicitly unsupported in this version

The validator rejects sound feedback, other themes, balanced random counts,
alternative sequence start rules, other premature/unmapped-key policies,
disabling held-key protection, changing the break key, disabling configuration
or JSON saving, and changing the CSV format. These are extension points, not
options that silently do nothing. A session is limited to 100,000 planned trials.

The historical protocol and all provisional defaults are documented separately
in `DECISIONS.md`. Edit study settings only after considering their scientific
implications; the application validates consistency, not experimental validity.

## Motivational block summary

`breaks.showSummary` (default `true`) shows the results of the block just
completed: caught mice in a cage and escaped mice beside a cheese wedge.
Correct responses count as caught, wrong mapped responses and timeouts as
escaped. Interrupted trials are not counted. Practice is summarized separately.
The screen shows exact totals and one mouse per trial up to 96 in each group;
longer blocks add a clearly labelled remainder.

`instructions.blockEncouragement` sets the encouraging sentence. These two
settings are optional for compatibility with earlier configuration files; their
resolved defaults are saved with the session. Keyboard-only continuation is
unchanged. No running score is displayed during timed trials.

## Hintergrundfarbe

`presentation.backgroundColor` setzt die Hintergrundfarbe für Vorbereitung,
Anleitung, Aufgaben, Rundenpausen und Abschluss. Die Farbe wird beim Laden der
Einstellungen angewendet und mit den Sitzungsdaten gespeichert. Eingabefelder
und farbige Ziellöcher behalten ihre eigenen Farben.

Beispiel: `"backgroundColor": "#E6CF99"` ist ein heller Ockerton. Für Weiß
`"#FFFFFF"` eintragen. Erlaubt sind sechsstellige Hex-Farben im Format #RRGGBB.
Fehlt die Einstellung in einer älteren Datei, wird #E6CF99 ergänzt.


## Hinweis bei einer nicht zugeordneten Taste (15.11.2026)

`response.unmappedKey` ist jetzt `"warn_and_repeat"`. Eigene ältere
Konfigurationen mit `"ignore_and_log"` müssen entsprechend angepasst werden;
sie werden mit einer Fehlermeldung abgelehnt, statt unbemerkt anders zu laufen.
`instructions.invalidKey` enthält den Hinweistext. Fehlt dieser Text in einer
eigenen Datei, wird der deutsche Standardtext verwendet. Bei einer anderen Anzahl
als vier Positionen bitte auch den Text anpassen.

Eine neue, nicht zugeordnete Taste während der Anzeige der Maus blendet den großen
Hinweis ein. Ein weiterer frischer Tastendruck schließt ihn. Dieselbe Maus erscheint
erneut; Reaktionszeit und gegebenenfalls Antwortfrist beginnen neu. Die Fortsetzungstaste
zählt nicht als Antwort. Esc beendet weiterhin den Test. Gehaltene Tasten und
automatische Wiederholungen werden ignoriert. In Pausen gilt weiterhin jede Taste
als Fortsetzung; während des Intervalls oder Feedbacks werden frühe Eingaben nur protokolliert.

Pro geplantem Versuch bleibt genau eine Datenzeile erhalten:

- `valid_resoponse`: exakt diese Schreibweise; 0, sobald der Hinweis in diesem Versuch
  ausgelöst wurde, sonst 1. Auch nach erfolgreicher Wiederholung bleibt die 0 erhalten.
  Dies ist kein allgemeines Qualitätsurteil: Auslassungen, Fokusverlust und Fehler
  müssen zusätzlich über `outcome`, `interrupted` und `correct` ausgewertet werden.
- Eine falsche, aber zugeordnete farbige Taste ergibt `correct = false` und ohne
  vorherigen Hinweis weiterhin `valid_resoponse = 1`.
- `rtMs` bezieht sich auf die letzte Anzeige der Maus; `onsetTimestampMs` ist deren
  Startzeit. `stimulusOnsetsMs` enthält alle Anzeigezeitpunkte einschließlich Wiederholungen.
- `intervalFromPreviousResponseMs` bezieht sich weiterhin auf die erste Anzeige des
  geplanten Versuchs. `inputEvents` enthält ungültige Tasten und Fortsetzungstasten
  mit Zeitpunkten und Gründen (`unmapped_key`, `warning_continue`).

Die Felder stehen im CSV- und JSON-Export. Bei älteren gespeicherten Sitzungen
bleiben die neuen CSV-Felder leer; alte Daten werden nicht nachträglich bewertet.

Der Hinweis zeigt zwischen `instructions.invalidKey` und
`instructions.invalidKeyContinue` die farbigen Tastenkreise. Farbe, Beschriftung und
Reihenfolge kommen direkt aus `positions`, wie bei der Anleitung.

`instructions.ready` und `instructions.readyContinue` steuern den zusätzlichen
Vorbereitungsbildschirm nach der Anleitung. Ohne diese Felder werden die deutschen
Standardtexte verwendet. Tastenkreise werden aus `positions` erzeugt.

Die Kinderanleitung verwendet `instructions.title`, `story`, `storyAction`,
`controlsTitle`, `general`, `controlsAction`, `questions` und `nextPage`.
`general` ist jetzt die kurze Erklärung der Fallen auf Seite 2.
Die Texte können in der Konfigurationsdatei verändert werden; neue fehlende
Felder erhalten deutsche Standardtexte. `extraTitle` ist die Überschrift einer
gegebenenfalls vorhandenen Zusatzinstruktion der gewählten Variante.
Der neue Standardhintergrund ist `#FFCE25` (Gelb aus der Bildvorlage).

Die neue Beispielseite verwendet `instructions.caughtExample`, `escapedExample`
und `outcomesContinue`. Sie zeigt Gitter und Käse wie im tatsächlichen Feedback.
`controlsAction` ist in Demo und Studie leer; `questions` ist dort jetzt nur
„Drücke eine Taste.“ Der Ablauf ist Geschichte → Tasten → Bildbeispiele →
gegebenenfalls Variantenhinweis → Finger hinlegen → Aufgabe.

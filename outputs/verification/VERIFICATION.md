# Verification — 2026-11-13

These are synthetic operator test sessions, not research participant data.

- Automated tests: 12 passing tests for protocol expansion, seed reproducibility,
  randomization, practice labeling, validation, held-key tracking, CSV encoding,
  response acceptance, early/unmapped/repeat handling, timeouts and interruptions.
- Browser: Codex in-app browser on macOS; desktop layout inspected at 1024×768.
- `demo-session.json` and `.csv`: completed 24 trials over three blocks. One
  deliberately wrong mapped response and one ignored unmapped key; the remaining
  23 responses were correct. Space and button continuation were both exercised.
- Explicit instructions and first target (position 4) were checked in a separate
  session, stopped with Escape. Escape preserved a flagged partial trial.
- `timeout-session.json`: loaded `tests/fixtures/timeouts.json` through the file
  picker; completed one practice and two study trials with 300 ms deadlines and
  zero feedback. All three timed out with null RT/response and separate timeout
  timestamps. Software timeout detection was at least 300 ms after onset.
- Demo software intervals: minimum 500.9 ms, median 510.3 ms, maximum 516.6 ms
  for a requested 500 ms. These values describe this test, not a timing guarantee.
- Both demo downloads were parsed; the CSV contained 24 records and matched the
  intended outcome counts. No browser runtime errors were observed in that run.

Not verified: physical screen/keyboard latency, other operating systems or
standalone browser engines, or a real operating-system focus loss. The in-app
browser's separate tabs did not produce a normal focus transition; the
interruption logic has an automated behavior test, but needs a manual check in
the intended study browser. No scientific data collection readiness is claimed.

The earlier demo export predates the additive timeout/interval-anchor columns;
its recorded responses and timing values are unchanged.

## Motivational summary update

- Fourteen automated tests pass, including completed-block counting, timeout
  classification, practice separation, interrupted-trial exclusion and zero counts.
- Browser test: eight demo trials with five correct and three wrong responses
  produced five mice in the cage and three at the cheese, with exact counts.
- A mapped keyboard key continued the break without a click; the next stimulus
  remained waiting for a new response. Escape then preserved the partial session.
- Cage layout was inspected at narrow and desktop widths. The preview is saved
  as `block-summary.jpg`. No browser runtime errors were observed.

## Deutsche Oberfläche

- Deutsche Vorbereitung, Anleitung ohne Reihenfolge-Hinweis, Rundenpause,
  Abbruchmeldung, Dateiauswahl und Ergebnisbereich im Browser geprüft.
- Variante 2 zeigt zusätzlich die kurze Erklärung zur festen Reihenfolge;
  Variante 1 zeigt diese Erklärung nicht.
- Ein Test mit sechs gefangenen und zwei entkommenen Mäusen zeigte die passenden
  deutschen Beschriftungen. Fortsetzen per Taste funktionierte weiterhin.
- Ein kurzer Test wurde bis zum deutschen Abschluss „Geschafft!“ ausgeführt.
- 14 vorhandene automatisierte Tests bestanden. Keine Browserfehler beobachtet.
- Bildschirmfoto der Anleitung: `anleitung-de.jpg`.

## Mausfarben und Käseüberlagerung

- Alpha-Kanal der neuen PNG-Datei geprüft: RGBA, transparente Außenfläche.
- Maus vor einem roten Kreis im Browser geprüft: eigene Farben, kein weißer
  Kasten, keine Farbmischung.
- Falsche Antwort: großes Käsebild innerhalb des Kreises vor dem Körper der Maus.
- Beim nächsten Ziel ist das Käsebild wieder unsichtbar; korrekte Antwort zeigt
  weiterhin die Gitterstäbe. Keine Browserfehler beobachtet.
- Für die Sichtprüfung wurde ausschließlich `tests/fixtures/feedback-preview.json`
  mit 5 Sekunden Rückmeldung verwendet. Demo und Studie bleiben bei ihren
  bisherigen Zeiten.
- Bildschirmfotos: `maus-farben.jpg` und `maus-kaese.jpg`.

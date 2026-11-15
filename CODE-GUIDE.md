# Reading the code

The application uses plain JavaScript modules and classes. There is no build step
for our code. Edit a file, reload the browser, and start a new session.

## Start here

1. `src/main.js` connects the setup screen, experiment and results screen.
2. `src/Experiment.js` creates the session and its jsPsych timeline.
3. `src/TrialPlanner.js` produces every planned stimulus before testing begins.
4. `src/SrtTrial.js` runs one stimulus–response–feedback cycle.
5. `src/MouseDisplay.js` draws that cycle on screen.

The other classes have narrow supporting roles:

| File | Responsibility |
| --- | --- |
| `StudyConfig.js` / `ConfigShape.js` | Reject invalid, unknown or unsupported settings |
| `RandomGenerator.js` | Reproduce random trials from a saved seed |
| `SrtPlugin.js` | Connect our trial class to jsPsych |
| `InvalidKeyWarning.js` | Display and remove the large keyboard reminder |
| `ResponseCollector.js` | Track physical keys, including held keys across trials |
| `Timing.js` | Schedule visual changes on animation frames |
| `Screens.js` | Instruction and break screen definitions |
| `BreakPlugin.js` | Keyboard-only breaks, with held-key protection |
| `BlockSummary.js` | Counts catches and escapes in the completed block |
| `BlockSummaryDisplay.js` | Draws the cage, cheese and counted mice |
| `SessionStore.js` | Save recovery snapshots in the current browser |
| `ResultExporter.js` | Produce CSV and JSON downloads |
| `SetupView.js` / `ResultsView.js` | Experimenter setup and result download controls |

## How a trial runs

`Experiment` gives `SrtPlugin` a planned trial and shared session context.
The plugin creates `SrtTrial` and passes its result back to jsPsych.

Within `SrtTrial.run()`:

1. Mount the empty holes and start observing keys and interruptions.
2. Wait until the next scheduled onset, then draw the mouse on an animation frame.
3. Record the software onset timestamp; accept a fresh mapped keypress.
4. Record RT immediately. The first accepted response ends the response window.
5. Show feedback, then clear it. Finish this trial and save its record.
6. The next trial waits for the previous response timestamp plus the configured
   total interval. Feedback is included in that interval, not added to it.

The phases are named `interval`, `stimulus`, `response_recorded`, `feedback`,
and `finished`. Early, unmapped and repeated keys are logged with reasons.
They do not create responses or shorten the interval.

The controller in each trial cancels pending frame callbacks when focus is lost
or Escape is pressed. The affected record is retained and later trials are
skipped. This version stops the session; it does not resume interrupted trials.

## Common changes

- **Different sequence, block count or timing:** edit a copy of `config/study.json`.
- **Different mouse graphics or feedback:** edit `MouseDisplay.js`, assets and CSS.
- **Different response policy:** implement it in `SrtTrial.js` and update
  `StudyConfig.js` to accept the new option. Add a behavior test.
- **Different randomization constraints:** edit `TrialPlanner.js`, then validate
  and test the new settings.
- **Additional exported measurements:** add them to the trial record and the CSV
  column list in `ResultExporter.js`. JSON already retains the full record.

`vendor/` contains third-party source; it is not our application code. The
readability/size conventions apply to `src/`, not bundled library internals.

`Appearance.js` überträgt die konfigurierte Hintergrundfarbe auf alle Bildschirme.

Invalid keys during the stimulus enter the `warning` phase. A fresh key repeats
the same target with a new onset. `SrtTrial` keeps one result with validity 0
and all onset timestamps; `InvalidKeyWarning` only handles presentation.

`ReadyPlugin.js` handles the keyboard-only preparation screen before the first
trial. `KeyGuide.js` renders the configured circular key guide for this screen and
the invalid-key warning. `assets/summary-cheese.svg` is the taller break-only
variant of the cheese; trial error feedback keeps its original cheese asset.

`InstructionPlugin.js` advances the short instruction pages with fresh keys.
`InstructionDisplay.js` renders text and the configured hole/key mapping.
The extra condition instruction has its own optional page before ReadyPlugin.

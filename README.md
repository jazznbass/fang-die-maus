[Deutsche Anleitung für die Testleitung](ANLEITUNG.md)

[Ideen und offene Aufgaben](TODO.md)

# Mouse SRT — local browser experiment

A first working version of the configurable mouse-catching serial reaction time
paradigm. It uses jsPsych 8.3.0 and small JavaScript classes in separate files.
Original C++ files and study materials remain unchanged.

## Run it

Node.js is required for the small local server (tested with Node 26.11.1).
No npm installation or internet connection is needed to run this copy: the
browser libraries and artwork are included locally.

On macOS, double-click `Start-SRT.command`, or run from this directory:

```sh
npm start
```

Then open **http://127.0.0.1:8000** in your browser. Keep the terminal open while
using the experiment. Stop the server with Ctrl+C when finished. On Windows,
`Start-SRT.cmd` starts the same server when Node.js is installed. On Linux,
use `npm start`. Do not open `index.html` directly with a file URL.

The server listens only on this computer. If port 8000 is already occupied,
stop the existing server or set `SRT_PORT` to another port before starting.
Browser recovery storage is tied to the exact browser profile and address,
including the port; use the same address consistently.

## Try the task

1. Select **Short demo** (24 trials) or **Full study** (480 trials).
2. Enter a participant ID using letters, numbers, underscores or hyphens.
3. Select implicit or explicit, then start and read the instructions.
4. Press the physical keys corresponding to Y, X, M and comma on German QWERTZ.
5. Between blocks, see caught mice in the cage and escaped mice at the cheese.
   Continue by pressing any key. Escape stops an active trial
   and preserves a partial session.
6. Download the trial CSV and session JSON on the final screen.

The demo has three blocks: one eight-item sequence, eight random trials, and
one eight-item sequence. It shows key labels and stays windowed. The full study
uses the original five-block arrangement and requests fullscreen.

To try different settings, copy `config/study.json`, edit the copy, and select
**Load a JSON file…**. This reads a local file; it does not upload it to a service.
Configuration errors are displayed before the task starts.

## Results and recovery

- **CSV:** raw trial records, including practice trials, mistakes, timeouts,
  interruptions and logged input events.
- **JSON:** the same records plus the resolved configuration, condition, seed,
  full trial plan, session identifiers, software versions and environment.
- **Recovery:** a snapshot is saved in this browser at session start and after
  every finished trial. Expand “Recover previous sessions” to download it later.
  Earlier sessions are retained, not overwritten by a new session.

Recovery storage is not a substitute for exported files. Clearing browser data
removes it. An abrupt close can lose the current unfinished trial; a recovery
record marked `running` must not be treated as a completed session. Recovery
allows download, not resumption. A storage write failure stops further trials;
use the download buttons to preserve the in-memory record.

RT is captured before feedback and waiting. The default 500 ms interval includes
400 ms feedback. Visual updates are aligned to animation frames, so actual
software intervals can be longer; those intervals are recorded. Physical
screen/input latency still requires validation on the study equipment.

Focus loss during an active trial stops the session and flags that trial.
No responses or trials are silently replaced. This behavior needs a manual
check in the intended standalone browser before data collection.

## Find your way around

- `DECISIONS.md`: agreed architecture, historical procedure and provisional settings.
- `CODE-GUIDE.md`: reading order, class responsibilities and where to make changes.
- `CONFIGURATION.md`: supported settings and precise timing/response semantics.
- `src/`: our readable application code; one main responsibility per class.
- `styles/`: presentation CSS.
- `assets/`: original mouse artwork and provenance notes.
- `vendor/`: pinned third-party browser libraries and license notices.
- `tests/`: automated behavior tests and a short timeout fixture.
- `outputs/verification/`: synthetic test exports and the verification report.

## Development checks

```sh
npm test
```

The tests use Node's built-in test runner; no additional test package is needed.
To reinstall the pinned dependencies and refresh the vendored browser files:

```sh
npm ci --ignore-scripts
npm run vendor
```

Only dependency installation needs internet access. Our code uses native modules
and requires no build step. Reload the page after changes, then start a new
session. Existing sessions retain their saved settings.

## Current limits

This is version 0.1.0 for trying and refining the paradigm, not a validated study
release. Fourteen automated tests pass; the 24-trial demo, exports, explicit
instructions, Escape handling and a timeout/practice configuration have been
checked in the in-app browser on macOS. Windows, Linux and standalone browser
versions have not yet been tested. See the verification report for exact scope.

Several scientific settings remain provisional, including exact feedback,
practice, breaks, randomization details and key mapping. A transparent derivative of the original mouse
image is used; cage bars are CSS and cheese is drawn as a large SVG overlay.
Sound feedback and several future configuration variants are explicitly rejected
rather than silently ignored. No server-side data collection is implemented.

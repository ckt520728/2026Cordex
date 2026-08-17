# End-of-day wrap-up: HHSA Signal Lab

Date: 2026-08-17

Project: dynamic simulator for EMD-based Hilbert Huang Transform (HHT) and
the extended Holo-Hilbert Spectral Analysis (HHHSA).

## Outcome

The simulator was rebuilt as a local-first, Apps Script-compatible web app and
deployed to Google Apps Script as `HHSA Signal Lab`, version 5 on the existing
deployment URL.

Public web-app URL:

<https://script.google.com/macros/s/AKfycbw5ntn-fRkXiEMI_-Adk3Zvd71W6MIjDVtSA-jMyfvPyj1eOFqdFIheMFRFhKDPLNDg/exec>

The Apps Script editor and bound spreadsheet were created successfully. Their
private editor/container links are intentionally not recorded in this public
repository.

## Created products

The reproducible product bundle is in
`outputs/hhsa-signal-lab-2026-08-17/`:

- `index.html` - responsive signal-lab interface and Apps Script/local asset bridge.
- `main.js` - animated synthetic signal, controls, HHT/HHHSA views, phase markers,
  case selection, and readouts.
- `data.js` - deterministic six-condition holo-spectrum and detector payload from
  the Python prototype.
- `data.html` and `main.html` - browser assets served as HTML files by Apps Script.
- `Code.gs` - Apps Script `doGet`, server-side base64 asset injection, auth helpers,
  Sheets/Docs logging, and marker-only safety boundary.
- `appsscript.json` - Asia/Taipei runtime, anonymous web-app manifest, and
  required Sheets/Docs/Drive scopes.
- `.claspignore` - keeps browser-only `.js` files out of the Apps Script project.
- `README.md` - local run instructions, interactions, deployment notes, and checks.

## What the simulator demonstrates

1. EMD separates the oscillatory carrier modes.
2. The Hilbert transform exposes instantaneous amplitude and phase.
3. HHHSA decomposes the carrier IMF envelope a second time, revealing the
   carrier-frequency x AM-frequency holo-spectrum.
4. The envelope phase becomes a simulated trigger coordinate.

Interactive controls include carrier frequency, AM frequency, modulation depth,
observation noise, target phase, pause/resume, reset, and a new noise seed. The
six synthetic cases cover clean AM, theta-gamma PAC, sawtooth false-PAC guard,
PD-style beta bursts, AD/MCI-style slowing, and a TRD gamma-AM marker.

## Verification performed

- `node --check webapp/main.js` - passed.
- `node --check webapp/data.js` - passed.
- `node check-webapp.mjs webapp` - passed: HTML script block, `Code.gs`, and
  six-condition payload all validated.
- DOM contract check - passed: 15 JavaScript-referenced element IDs exist.
- `clasp show-file-status --json` - confirmed five deployable files:
  `appsscript.json`, `Code.gs`, `data.html`, `index.html`, and `main.html`.
- `clasp push --force` - uploaded the five Apps Script-compatible files above.
- `clasp create-deployment` - updated the existing deployment through version 5.
- `clasp open-web-app <deploymentId> --json` - returned the URL recorded above.
- Read-only live probe - returned HTTP 200, the `HHSA Signal Lab` title, and the
  embedded data payload, with no `SyntaxError`, `ReferenceError`, or `window is
  not defined` response.

## Pitfalls and resolutions

### 1. The original UI had encoding damage and was not a reliable local preview

The prototype contained mojibake labels and Apps Script template expressions
that made a direct local open fragile. The UI was rebuilt in readable English,
while preserving the deterministic scientific payload and the backend logging
architecture.

### 2. Local files and Apps Script need different asset loading paths

Apps Script cannot serve sibling JavaScript files like a normal static server.
The final page injects the browser code from `data.html` and `main.html` when
served by Apps Script and falls back to `data.js` / `main.js` when opened locally.

### 3. The existing `.clasp.json` was only a placeholder

The placeholder script ID caused `create-script` to refuse the operation. A clean
staging directory was used to create the authorized new Sheets-bound project;
the real script ID was then bound to the simulator source folder. The public
product bundle intentionally omits `.clasp.json`.

### 4. `clasp push` initially reported skipping the push

`show-file-status` confirmed pending files. An explicit `clasp push --force`
uploaded the intended source successfully.

### 5. Deployment URLs must not be guessed

The web-app URL was obtained from `open-web-app --json` using the deployment ID.
It was not constructed from the script ID.

### 6. Apps Script executed browser JavaScript as server code

The first deployment uploaded `data.js` and `main.js` as Apps Script files. Apps
Script tried to execute `data.js` on the server and failed with
`ReferenceError: window is not defined`. The fix is to keep browser code in
`data.html` and `main.html`, exclude the `.js` files with `.claspignore`, and
inject their base64 contents into the HTML response from `doGet()`.

### 7. Template evaluation caused a second deployment error

The initial template-based `doGet()` path returned `SyntaxError: Invalid or
unexpected token` from `Code.gs`. The final handler uses
`createHtmlOutputFromFile()` plus explicit server-side asset replacement. The
live probe now returns HTTP 200 with the expected title and payload.

## End-of-day handoff

Refresh/open the public web-app URL in a browser, confirm the page loads, switch
between `HHT / 1D` and `HHHSA / 2D`, select at least one synthetic case, and
verify that the controls update the live trace.

Scientific boundary: all signals, spectra, and trigger markers are simulated or
precomputed. The app does not analyze real EEG, deliver stimulation, or make a
clinical diagnosis.

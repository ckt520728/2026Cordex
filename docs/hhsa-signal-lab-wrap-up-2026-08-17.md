# End-of-day wrap-up — HHSA Signal Lab

Date: 2026-08-17

Project: dynamic simulator for EMD-based Hilbert Huang Transform (HHT) and
the extended Holo-Hilbert Spectral Analysis (HHHSA)

## Outcome

The simulator was rebuilt as a local-first, Apps Script-compatible web app and
deployed to Google Apps Script as `HHSA Signal Lab`, version 1.

Public web-app URL:

<https://script.google.com/macros/s/AKfycbw5ntn-fRkXiEMI_-Adk3Zvd71W6MIjDVtSA-jMyfvPyj1eOFqdFIheMFRFhKDPLNDg/exec>

The Apps Script editor and bound spreadsheet were created successfully. Their
private editor/container links are intentionally not recorded in this public
repository.

## Created products

The reproducible product bundle is in
`outputs/hhsa-signal-lab-2026-08-17/`:

- `index.html` — responsive signal-lab interface and Apps Script/local asset bridge.
- `main.js` — animated synthetic signal, controls, HHT/HHHSA views, phase markers,
  case selection, and readouts.
- `data.js` — deterministic six-condition holo-spectrum and detector payload from
  the Python prototype.
- `Code.gs` — Apps Script `doGet`, base64 asset embedding, auth helpers, Sheets/
  Docs logging, and marker-only safety boundary.
- `appsscript.json` — Asia/Taipei runtime, anonymous web-app manifest, and
  required Sheets/Docs/Drive scopes.
- `README.md` — local run instructions, interactions, deployment notes, and
  verification commands.

## What the simulator demonstrates

1. EMD separates the oscillatory carrier modes.
2. The Hilbert transform exposes instantaneous amplitude and phase.
3. HHHSA decomposes the carrier IMF envelope a second time, revealing the
   carrier-frequency × AM-frequency holo-spectrum.
4. The envelope phase becomes a simulated trigger coordinate.

Interactive controls include carrier frequency, AM frequency, modulation depth,
observation noise, target phase, pause/resume, reset, and a new noise seed.
The six synthetic cases cover clean AM, theta–gamma PAC, sawtooth false-PAC
guard, PD-style beta bursts, AD/MCI-style slowing, and a TRD gamma-AM marker.

## Verification performed

- `node --check webapp/main.js` — passed.
- `node --check webapp/data.js` — passed.
- `node check-webapp.mjs webapp` — passed: HTML script block, `Code.gs`, and
  six-condition payload all validated.
- DOM contract check — passed: 15 JavaScript-referenced element IDs exist.
- `clasp show-file-status --json` — confirmed five deployable files.
- `clasp push --force` — uploaded `appsscript.json`, `Code.gs`, `data.js`,
  `index.html`, and `main.js`.
- `clasp create-deployment --description "HHSA Signal Lab v1"` — created
  deployment version 1.
- `clasp open-web-app <deploymentId> --json` — returned the URL recorded above.

## Pitfalls and resolutions

### 1. The original UI had encoding damage and was not a reliable local preview

The prototype contained mojibake labels and Apps Script template expressions
that made a direct local open fragile. The UI was rebuilt in readable English,
while preserving the deterministic scientific payload and the backend logging
architecture.

### 2. Local files and Apps Script need different asset loading paths

Apps Script cannot serve sibling JavaScript files like a normal static server.
The new page uses a base64 asset bridge when rendered by Apps Script and falls
back to `data.js` / `main.js` sibling files when opened locally.

### 3. The existing `.clasp.json` was only a placeholder

The placeholder script ID caused `create-script` to refuse the operation. A clean
staging directory was used to create the authorized new Sheets-bound project;
the real script ID was then bound to the simulator source folder. The public
product bundle intentionally omits `.clasp.json`.

### 4. `clasp push` initially reported “Skipping push”

`show-file-status` confirmed five files were pending. A single explicit
`clasp push --force` uploaded the intended source successfully.

### 5. Deployment URLs must not be guessed

The web-app URL was obtained from `open-web-app --json` using the deployment ID.
It was not constructed from the script ID.

### 6. Automated anonymous HTTP verification returned 403

The deployment metadata and web-app entry point exist, but a read-only HTTP
probe from this environment returned `403 Access Denied`. This may reflect the
request environment or the effective Apps Script access setting. A manual
browser check is still required before treating public access as verified.

## End-of-day handoff

Next check: open the public web-app URL in a browser, confirm the page loads,
switch between `HHT / 1D` and `HHHSA / 2D`, select at least one synthetic case,
and verify that the controls update the live trace. If the browser also returns
403, review the deployment's **Execute as** and **Who has access** settings in
Apps Script and redeploy the same project version.

Scientific boundary: all signals, spectra, and trigger markers are simulated or
precomputed. The app does not analyze real EEG, deliver stimulation, or make a
clinical diagnosis.

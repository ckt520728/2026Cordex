# HHSA Signal Lab

Interactive simulator for the method chain:

```text
EMD → Hilbert analytic signal → nested envelope EMD → HHHSA holo-spectrum
                                      ↓
                              phase marker / control coordinate
```

The page is a local-first, browser-only visualization. It uses the deterministic
spectra and detector statistics exported by the Python prototype in
`../data.js`. The live trace is a synthetic signal generated in the browser so
the carrier, AM frequency, modulation depth, noise, and target phase can be
tuned without recomputing the offline spectrum.

## Run locally

Open `index.html` directly, or serve this product folder with any static web server:

```bash
python -m http.server 8765 --directory .
```

The page will show a small local-preview notice. Apps Script logging is enabled
only when the page is served from a deployed Apps Script `/exec` URL.

## Main interactions

- `HHT / 1D` shows a carrier-frequency energy curve derived from the payload.
- `HHHSA / 2D` shows the nested carrier × AM-frequency holo-spectrum.
- The signal controls change the animated browser trace and target-phase markers.
- The six synthetic cases switch the precomputed spectrum and the live trace
  to matching carrier / AM coordinates.
- The method cards explain the EMD → Hilbert → HHHSA → phase-marker sequence.

## Apps Script deployment

`Code.gs` includes `doGet()` and a base64 asset bridge. When Apps Script renders
`index.html`, it embeds the raw client code from `data.html` and `main.html`;
when the same file is opened locally, it falls back to sibling `data.js` and
`main.js` files. `.claspignore` keeps those browser-only `.js` files out of the
Apps Script project, where `.js` files would otherwise execute server-side.
Existing Sheets / Docs run logging is kept in `Code.gs` and remains marker-only.

The spectra and detector statistics are simulated / precomputed. Nothing in
this app connects to hardware, delivers stimulation, or makes a clinical
diagnosis.

This bundle intentionally omits `.clasp.json`; bind it to your own Apps Script
project before using `clasp push`.

## Verification

From `hhsa-proto-wip`:

```bash
node check-webapp.mjs webapp
node --check webapp/main.js
node --check webapp/data.js
```

The first check validates the HTML script block, Apps Script backend syntax,
and the six-condition data payload.

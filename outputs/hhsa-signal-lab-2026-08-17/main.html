/* HHSA Signal Lab — browser interaction layer. */
(function () {
  "use strict";
  window.HHSA_SIGNAL_LAB_LOADED = true;

  var D = window.HHSA_DATA || null;
  var labels = {
    clean_am: { title: "Clean AM", detail: "16 Hz carrier · 2 Hz envelope", key: "ad" },
    theta_gamma_pac: { title: "Theta–gamma PAC", detail: "41.5 Hz carrier · 6.17 Hz AM", key: "ad" },
    sawtooth_guard: { title: "Sawtooth guard", detail: "harmonic false-PAC stress test", key: "ad" },
    pd_beta_bursts: { title: "PD-style beta bursts", detail: "beta carrier · slow burst AM", key: "pd" },
    ad_slowing: { title: "AD/MCI-style slowing", detail: "3.67 Hz carrier · 0.55 Hz AM", key: "ad" },
    trd_gamma_am: { title: "TRD gamma-AM marker", detail: "gamma carrier · 14.67 Hz AM", key: "trd" }
  };
  var steps = [
    "Start with the raw mixture. EMD separates oscillations without assuming a fixed basis.",
    "The Hilbert transform turns each IMF into an analytic signal with instantaneous amplitude and phase.",
    "HHHSA decomposes the IMF envelope again, making f_c × f_am visible in one map.",
    "The envelope phase becomes a control coordinate. The red/yellow markers are simulated only."
  ];
  var state = {
    condition: "clean_am",
    mode: "hht",
    step: 0,
    playing: true,
    speed: 1,
    time: 0,
    lastFrame: 0,
    carrier: 16,
    am: 2,
    depth: .8,
    noise: .04,
    target: -90,
    seed: 1,
    token: null
  };
  var els = {};

  function byId(id) { return document.getElementById(id); }
  function clamp(value, low, high) { return Math.max(low, Math.min(high, value)); }
  function round(value, digits) {
    var factor = Math.pow(10, digits || 0);
    return Math.round(value * factor) / factor;
  }
  function fmtPhase(value) { return (value < 0 ? "−" : "") + Math.abs(value) + "°"; }
  function hasBackend() {
    return typeof google !== "undefined" && google && google.script && google.script.run;
  }
  var NOT_HOSTED_MSG = "Local preview · run logging is available after Apps Script deployment.";

  function server(fnName) {
    var args = Array.prototype.slice.call(arguments, 1);
    if (!hasBackend()) return Promise.reject(new Error(NOT_HOSTED_MSG));
    return new Promise(function (resolve, reject) {
      var runner = google.script.run.withSuccessHandler(resolve).withFailureHandler(reject);
      runner[fnName].apply(runner, [state.token].concat(args));
    });
  }

  function getAuthConfig() {
    if (!hasBackend()) return Promise.resolve({ enabled: false });
    return new Promise(function (resolve, reject) {
      google.script.run.withSuccessHandler(resolve).withFailureHandler(reject).getAuthConfig();
    });
  }

  function setText(id, value) {
    if (byId(id)) byId(id).textContent = value;
  }

  function prepareCanvas(canvas) {
    var rect = canvas.getBoundingClientRect();
    var width = Math.max(280, Math.round(rect.width || canvas.width));
    var height = Math.max(220, Math.round(rect.height || canvas.height));
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var pixelWidth = Math.round(width * dpr);
    var pixelHeight = Math.round(height * dpr);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, width: width, height: height };
  }

  function drawGrid(ctx, left, top, width, height, rows, cols) {
    ctx.save();
    ctx.strokeStyle = "rgba(190, 214, 202, .11)";
    ctx.lineWidth = 1;
    for (var r = 0; r <= rows; r++) {
      var y = top + height * r / rows;
      ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(left + width, y); ctx.stroke();
    }
    for (var c = 0; c <= cols; c++) {
      var x = left + width * c / cols;
      ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, top + height); ctx.stroke();
    }
    ctx.restore();
  }

  function signalAt(time) {
    var envelope = 1 + state.depth * Math.sin(2 * Math.PI * state.am * time);
    var carrier = envelope * Math.sin(2 * Math.PI * state.carrier * time + .18);
    var texture = state.noise * (
      .62 * Math.sin(2 * Math.PI * 47 * time + state.seed) +
      .25 * Math.sin(2 * Math.PI * 83 * time + state.seed * 1.7) +
      .13 * Math.sin(2 * Math.PI * 131 * time + state.seed * .6)
    );
    return { signal: carrier + texture, envelope: envelope, phase: (state.am * time * 360) % 360 };
  }

  function drawTrace() {
    if (!els.traceCanvas) return;
    var view = prepareCanvas(els.traceCanvas);
    var ctx = view.ctx, w = view.width, h = view.height;
    var left = 43, right = 18, top = 22, bottom = h - 31;
    var plotW = w - left - right, plotH = bottom - top;
    var span = 2.4, samples = 760, start = state.time;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#101a1d"; ctx.fillRect(0, 0, w, h);
    drawGrid(ctx, left, top, plotW, plotH, 4, 8);
    ctx.strokeStyle = "rgba(234, 241, 229, .26)";
    ctx.beginPath(); ctx.moveTo(left, top + plotH / 2); ctx.lineTo(left + plotW, top + plotH / 2); ctx.stroke();

    var maxY = 2.15 + state.depth * .65 + state.noise;
    function xOf(time) { return left + (time - start) / span * plotW; }
    function yOf(value) { return top + (1 - (value + maxY) / (2 * maxY)) * plotH; }

    ctx.lineWidth = 1.25; ctx.strokeStyle = "#6ea8b6"; ctx.beginPath();
    for (var i = 0; i < samples; i++) {
      var t = start + span * i / (samples - 1);
      var point = signalAt(t);
      var x = xOf(t), y = yOf(point.signal);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.lineWidth = 2; ctx.strokeStyle = "#d76145"; ctx.beginPath();
    for (var j = 0; j < samples; j++) {
      var et = start + span * j / (samples - 1);
      var env = signalAt(et).envelope;
      var ey = top + plotH * .5 - (env - 1) / maxY * plotH * .42;
      if (j === 0) ctx.moveTo(xOf(et), ey); else ctx.lineTo(xOf(et), ey);
    }
    ctx.stroke();

    var period = 1 / Math.max(.1, state.am);
    var phaseOffset = (state.target / 360) * period;
    var first = Math.floor((start - phaseOffset) / period) - 1;
    var last = Math.ceil((start + span - phaseOffset) / period) + 1;
    ctx.save();
    for (var k = first; k <= last; k++) {
      var markerTime = phaseOffset + k * period;
      if (markerTime < start || markerTime > start + span) continue;
      var markerX = xOf(markerTime);
      ctx.strokeStyle = "rgba(243, 210, 124, .52)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(markerX, top); ctx.lineTo(markerX, bottom); ctx.stroke();
      var marker = signalAt(markerTime);
      var markerY = top + plotH * .5 - (marker.envelope - 1) / maxY * plotH * .42;
      ctx.fillStyle = "#f3d27c"; ctx.beginPath(); ctx.arc(markerX, markerY, 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    ctx.font = '10px "Cascadia Mono", monospace'; ctx.fillStyle = "#9bb1ad";
    ctx.fillText("+ amplitude", left, top - 7); ctx.fillText("0", left - 19, top + plotH / 2 + 4); ctx.fillText("− amplitude", left, bottom + 17);
    ctx.textAlign = "right"; ctx.fillText("window 2.4 s", w - right, bottom + 17); ctx.textAlign = "left";
    ctx.fillStyle = "#d76145"; ctx.fillText("a(t)", left + 7, top + 16);
    ctx.fillStyle = "#6ea8b6"; ctx.fillText("x(t)", left + 7, bottom - 7);
    setText("timeReadout", "t = " + state.time.toFixed(2) + " s  ·  φ = " + fmtPhase(round(currentPhase(), 0)));
  }

  function currentPhase() {
    var phase = (state.time * state.am * 360) % 360;
    return phase > 180 ? phase - 360 : phase;
  }

  function magma(value) {
    var stops = [
      [0, [16, 26, 29]], [0.2, [32, 62, 74]], [0.46, [74, 125, 128]],
      [0.7, [215, 97, 69]], [0.88, [243, 176, 105]], [1, [250, 229, 165]]
    ];
    var t = clamp(value, 0, 1), index = 0;
    while (index < stops.length - 2 && t > stops[index + 1][0]) index++;
    var a = stops[index], b = stops[index + 1], local = (t - a[0]) / (b[0] - a[0]);
    var rgb = a[1].map(function (channel, i) { return Math.round(channel + (b[1][i] - channel) * local); });
    return "rgb(" + rgb.join(",") + ")";
  }

  function log10(value) { return Math.log(value) / Math.LN10; }

  function drawHht(c) {
    var view = prepareCanvas(els.spectrumCanvas), ctx = view.ctx, w = view.width, h = view.height;
    var left = 55, right = 18, top = 25, bottom = h - 48, plotW = w - left - right, plotH = bottom - top;
    ctx.clearRect(0, 0, w, h); ctx.fillStyle = "#101a1d"; ctx.fillRect(0, 0, w, h);
    drawGrid(ctx, left, top, plotW, plotH, 4, 8);
    var values = [], max = 0;
    for (var j = 0; j < c.n_fc; j++) {
      var total = 0;
      for (var i = 0; i < c.n_fam; i++) total += (c.grid[i] && Number(c.grid[i][j])) || 0;
      values.push(total); max = Math.max(max, total);
    }
    if (!isFinite(max) || max <= 0) max = 1;
    function xOf(value) { return left + (log10(value) - log10(c.fc_bins[0])) / (log10(c.fc_bins[c.fc_bins.length - 1]) - log10(c.fc_bins[0])) * plotW; }
    function yOf(value) { return bottom - value / max * plotH * .88; }
    ctx.beginPath(); ctx.moveTo(xOf(c.fc_bins[0]), bottom);
    for (var p = 0; p < values.length; p++) ctx.lineTo(xOf((c.fc_bins[p] + c.fc_bins[p + 1]) / 2), yOf(values[p]));
    ctx.lineTo(xOf(c.fc_bins[c.fc_bins.length - 1]), bottom); ctx.closePath();
    ctx.fillStyle = "rgba(110, 168, 182, .28)"; ctx.fill();
    ctx.beginPath();
    for (var q = 0; q < values.length; q++) { var px = xOf((c.fc_bins[q] + c.fc_bins[q + 1]) / 2), py = yOf(values[q]); if (q === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
    ctx.strokeStyle = "#b8d47c"; ctx.lineWidth = 2.5; ctx.stroke();
    var peakX = xOf(c.peak_fc); ctx.strokeStyle = "#f3d27c"; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(peakX, top); ctx.lineTo(peakX, bottom); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#f3d27c"; ctx.beginPath(); ctx.arc(peakX, yOf(values.reduce(function (best, value) { return value > best ? value : best; }, 0)), 5, 0, Math.PI * 2); ctx.fill();
    ctx.font = '10px "Cascadia Mono", monospace'; ctx.fillStyle = "#9bb1ad"; ctx.textAlign = "center";
    [1, 2, 4, 8, 16, 32, 64, 128].forEach(function (tick) { if (tick < c.fc_bins[0] || tick > c.fc_bins[c.fc_bins.length - 1]) return; var tx = xOf(tick); ctx.fillText(String(tick), tx, bottom + 19); });
    ctx.fillText("carrier frequency f_c (Hz) · log scale", left + plotW / 2, h - 13); ctx.textAlign = "left";
    ctx.fillStyle = "#b8d47c"; ctx.fillText("one-dimensional IMF energy", left + 10, top + 17);
    ctx.fillStyle = "#f3d27c"; ctx.fillText("peak " + c.peak_fc + " Hz", clamp(peakX + 8, left + 8, w - 100), top + 34);
  }

  function drawHhhsa(c) {
    var view = prepareCanvas(els.spectrumCanvas), ctx = view.ctx, w = view.width, h = view.height;
    var left = 58, right = 25, top = 24, bottom = h - 52, plotW = w - left - right, plotH = bottom - top;
    ctx.clearRect(0, 0, w, h); ctx.fillStyle = "#101a1d"; ctx.fillRect(0, 0, w, h);
    function xOf(value) { return left + (log10(value) - log10(c.fc_bins[0])) / (log10(c.fc_bins[c.fc_bins.length - 1]) - log10(c.fc_bins[0])) * plotW; }
    function yOf(value) { return top + (1 - (log10(value) - log10(c.fam_bins[0])) / (log10(c.fam_bins[c.fam_bins.length - 1]) - log10(c.fam_bins[0]))) * plotH; }
    var max = 1;
    c.grid.forEach(function (row) { row.forEach(function (value) { max = Math.max(max, value); }); });
    for (var i = 0; i < c.n_fam; i++) {
      for (var j = 0; j < c.n_fc; j++) {
        var v = (c.grid[i] && c.grid[i][j]) || 0;
        var x0 = xOf(c.fc_bins[j]), x1 = xOf(c.fc_bins[j + 1]);
        var y0 = yOf(c.fam_bins[i + 1]), y1 = yOf(c.fam_bins[i]);
        ctx.fillStyle = magma(v / max); ctx.fillRect(x0, y0, Math.max(1, x1 - x0 + .5), Math.max(1, y1 - y0 + .5));
      }
    }
    ctx.strokeStyle = "rgba(244,240,231,.6)"; ctx.setLineDash([5, 5]); ctx.beginPath();
    var diagonalLow = Math.max(c.fc_bins[0], c.fam_bins[0]), diagonalHigh = Math.min(c.fc_bins[c.fc_bins.length - 1], c.fam_bins[c.fam_bins.length - 1]);
    ctx.moveTo(xOf(diagonalLow), yOf(diagonalLow)); ctx.lineTo(xOf(diagonalHigh), yOf(diagonalHigh)); ctx.stroke(); ctx.setLineDash([]);
    var markerX = xOf(c.peak_fc), markerY = yOf(c.peak_fam);
    ctx.strokeStyle = "#f3d27c"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(markerX - 9, markerY); ctx.lineTo(markerX + 9, markerY); ctx.moveTo(markerX, markerY - 9); ctx.lineTo(markerX, markerY + 9); ctx.stroke();
    ctx.fillStyle = "#f3d27c"; ctx.beginPath(); ctx.arc(markerX, markerY, 4, 0, Math.PI * 2); ctx.fill();
    ctx.font = '10px "Cascadia Mono", monospace'; ctx.fillStyle = "#9bb1ad"; ctx.textAlign = "center";
    [1, 2, 4, 8, 16, 32, 64, 128].forEach(function (tick) { if (tick >= c.fc_bins[0] && tick <= c.fc_bins[c.fc_bins.length - 1]) ctx.fillText(String(tick), xOf(tick), bottom + 19); });
    ctx.textAlign = "right";
    [.25, .5, 1, 2, 4, 8, 16, 32, 64].forEach(function (tick) { if (tick >= c.fam_bins[0] && tick <= c.fam_bins[c.fam_bins.length - 1]) ctx.fillText(String(tick), left - 9, yOf(tick) + 3); });
    ctx.textAlign = "center"; ctx.fillText("carrier frequency f_c (Hz) · log scale", left + plotW / 2, h - 14);
    ctx.save(); ctx.translate(15, top + plotH / 2); ctx.rotate(-Math.PI / 2); ctx.fillText("AM frequency f_am (Hz)", 0, 0); ctx.restore(); ctx.textAlign = "left";
    ctx.fillStyle = "#b8d47c"; ctx.fillText("nested envelope energy", left + 10, top + 17);
    ctx.fillStyle = "#f3d27c"; ctx.fillText("peak " + c.peak_fc + " × " + c.peak_fam + " Hz", clamp(markerX + 8, left + 8, w - 160), top + 35);
  }

  function drawSpectrum() {
    if (!D || !D.conditions[state.condition]) return;
    var c = D.conditions[state.condition];
    if (state.mode === "hht") {
      drawHht(c);
      setText("spectrumTitle", "HHT: carrier spectrum");
      setText("spectrumCaption", "One horizontal axis: where the IMF oscillates.");
      setText("spectrumBadge", "1D IMF readout");
      setText("spectrumLegend", "carrier frequency f_c · log scale");
    } else {
      drawHhhsa(c);
      setText("spectrumTitle", "HHHSA: holo-spectrum");
      setText("spectrumCaption", "A second EMD layer adds the AM frequency coordinate.");
      setText("spectrumBadge", "2D nested readout");
      setText("spectrumLegend", "carrier f_c × AM f_am · diagonal = f_am < f_c");
    }
  }

  function updateReadouts() {
    if (!D) return;
    var c = D.conditions[state.condition];
    var label = labels[state.condition] || { title: state.condition, detail: "synthetic case", key: "ad" };
    setText("signalTitle", label.title + " · live carrier");
    setText("signalCaption", "Carrier " + state.carrier.toFixed(1) + " Hz · AM " + state.am.toFixed(1) + " Hz · depth " + state.depth.toFixed(2) + ". Yellow markers target " + fmtPhase(state.target) + ".");
    setText("readoutSubtitle", label.title + " · " + label.detail);
    setText("carrierReadout", state.carrier.toFixed(1));
    setText("amReadout", state.am.toFixed(1));
    setText("triggerReadout", String(Math.max(1, Math.round(state.am * 10))));
    setText("meanReadout", (D.detector.mean_err_target > 0 ? "+" : "") + D.detector.mean_err_target.toFixed(2) + "°");
    setText("sdReadout", D.detector.sd_err_target.toFixed(2) + "°");
    setText("clinicalNote", D.clinical[label.key] || "Synthetic marker condition from the prototype.");
    setText("carrierOutput", state.carrier.toFixed(1) + " Hz");
    setText("amOutput", state.am.toFixed(1) + " Hz");
    setText("depthOutput", state.depth.toFixed(2));
    setText("noiseOutput", state.noise.toFixed(2));
    setText("phaseOutput", fmtPhase(state.target));
    if (state.mode === "hht") {
      setText("insight", "Read the line: HHT localizes the carrier around " + state.carrier.toFixed(1) + " Hz. Its amplitude changes over time, but the modulator is not an explicit second frequency axis.");
    } else {
      setText("insight", "Read the map: HHHSA places the carrier near " + c.peak_fc + " Hz and exposes the envelope near " + c.peak_fam + " Hz — the nested coordinate HHT leaves implicit.");
    }
    setText("stepNote", steps[state.step]);
  }

  function syncRangeInputs() {
    if (byId("carrierRange")) byId("carrierRange").value = state.carrier;
    if (byId("amRange")) byId("amRange").value = state.am;
    if (byId("depthRange")) byId("depthRange").value = state.depth;
    if (byId("noiseRange")) byId("noiseRange").value = state.noise;
    if (byId("phaseRange")) byId("phaseRange").value = state.target;
  }

  function setCondition(name, usePeak) {
    if (!D || !D.conditions[name]) return;
    state.condition = name;
    state.time = 0;
    if (usePeak) {
      var c = D.conditions[name];
      state.carrier = clamp(c.peak_fc, 8, 48);
      state.am = clamp(c.peak_fam, .5, 16);
    }
    Array.prototype.forEach.call(document.querySelectorAll("[data-condition]"), function (button) { button.classList.toggle("is-active", button.getAttribute("data-condition") === name); });
    syncRangeInputs(); updateReadouts(); drawSpectrum();
  }

  function buildCaseButtons() {
    var grid = byId("caseGrid");
    if (!grid || !D) return;
    grid.innerHTML = "";
    Object.keys(D.conditions).forEach(function (name) {
      var info = labels[name] || { title: name, detail: "synthetic case" };
      var button = document.createElement("button");
      button.className = "case-button" + (name === state.condition ? " is-active" : "");
      button.setAttribute("data-condition", name);
      button.innerHTML = "<strong>" + info.title + "</strong><span>" + info.detail + "</span>";
      button.addEventListener("click", function () { setCondition(name, true); });
      grid.appendChild(button);
    });
  }

  function bindControls() {
    [
      ["carrierRange", "carrier"], ["amRange", "am"], ["depthRange", "depth"], ["noiseRange", "noise"], ["phaseRange", "target"]
    ].forEach(function (pair) {
      var input = byId(pair[0]);
      if (!input) return;
      input.addEventListener("input", function () { state[pair[1]] = Number(input.value); updateReadouts(); });
      input.addEventListener("change", function () { drawSpectrum(); });
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-mode]"), function (button) {
      button.addEventListener("click", function () {
        state.mode = button.getAttribute("data-mode");
        Array.prototype.forEach.call(document.querySelectorAll("[data-mode]"), function (item) { item.classList.toggle("is-active", item === button); });
        updateReadouts(); drawSpectrum();
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-step]"), function (button) {
      button.addEventListener("click", function () {
        state.step = Number(button.getAttribute("data-step"));
        Array.prototype.forEach.call(document.querySelectorAll("[data-step]"), function (item) { item.classList.toggle("is-active", item === button); });
        updateReadouts();
      });
    });
    byId("playButton").addEventListener("click", function () {
      state.playing = !state.playing;
      setText("playButton", state.playing ? "Pause stream" : "Resume stream");
      setText("playState", state.playing ? "streaming" : "paused");
    });
    byId("resetButton").addEventListener("click", function () {
      state.time = 0; state.carrier = 16; state.am = 2; state.depth = .8; state.noise = .04; state.target = -90; state.seed = 1;
      syncRangeInputs(); updateReadouts(); drawSpectrum();
    });
    byId("shuffleButton").addEventListener("click", function () {
      state.seed = Math.random() * 10; state.time = 0; drawTrace();
    });
  }

  function currentSummary() {
    var c = D.conditions[state.condition];
    return "condition=" + state.condition + " peak_fc=" + c.peak_fc + "Hz peak_fam=" + c.peak_fam + "Hz detector_triggers=" + D.detector.triggers + " mean_err=" + D.detector.mean_err_target + "deg sd_err=" + D.detector.sd_err_target + "deg delay=" + D.detector.delay_ms + "ms";
  }

  function unlock() {
    var code = byId("passcodeInput").value;
    setText("passcodeMsg", "Checking…");
    server("login", code).then(function (res) {
      if (res && res.ok && res.token) { state.token = res.token; byId("passcodeScreen").style.display = "none"; }
      else setText("passcodeMsg", (res && res.message) || "Invalid passcode.");
    }).catch(function (error) { setText("passcodeMsg", String(error.message || error)); });
  }

  function frame(now) {
    if (!state.lastFrame) state.lastFrame = now;
    var delta = Math.min(.05, Math.max(0, now - state.lastFrame) / 1000);
    state.lastFrame = now;
    if (state.playing) state.time += delta * state.speed;
    drawTrace();
    window.requestAnimationFrame(frame);
  }

  function boot() {
    if (!D) {
      var banner = byId("notHosted"); banner.style.display = "block"; banner.textContent = "HHSA data payload did not load. Open this folder through a local web server or Apps Script."; return;
    }
    els.traceCanvas = byId("traceCanvas"); els.spectrumCanvas = byId("spectrumCanvas");
    buildCaseButtons(); bindControls(); syncRangeInputs(); updateReadouts(); drawTrace(); drawSpectrum();
    byId("passcodeBtn").addEventListener("click", unlock);
    byId("passcodeInput").addEventListener("keydown", function (event) { if (event.key === "Enter") unlock(); });
    if (!hasBackend()) { byId("notHosted").style.display = "block"; byId("notHosted").textContent = NOT_HOSTED_MSG; }
    getAuthConfig().then(function (config) {
      if (config && config.enabled) { byId("passcodeScreen").style.display = "grid"; byId("passcodeScreen").setAttribute("aria-hidden", "false"); }
    }).catch(function () {});
    window.addEventListener("resize", function () { drawSpectrum(); drawTrace(); });
    window.requestAnimationFrame(frame);
  }

  try {
    boot();
    document.documentElement.setAttribute("data-hhsa-ready", "true");
  } catch (error) {
    var errorBanner = byId("notHosted");
    if (errorBanner) {
      errorBanner.style.display = "block";
      errorBanner.textContent = "Simulator startup error: " + String(error && error.message ? error.message : error);
    }
    if (window.console && console.error) console.error(error);
  }
}());

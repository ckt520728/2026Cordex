/**
 * HHSA demo web app -- Apps Script backend.
 *
 * Patterns follow gas-medical-webapp-generator: render-first UI, stateless
 * signed-token passcode gate (token-first convention), append-only Sheets
 * master log, Docs report generation with export URLs, and a runSelfTest()
 * that exercises the real Google APIs.
 *
 * Data flow: the holo-spectra and detector statistics are precomputed by the
 * Python prototype (prototype/export_web_data.py) and embedded in data.js.
 * This backend only logs demo runs and generates the report document.
 */

var SPREADSHEET_ID = "";   // fill in (or leave empty: falls back to the bound sheet)
var REPORT_FOLDER = "HHSA_Demo_Reports";

// ------------------------------------------------------------------ web --

/** Serve the simulator as a standalone Apps Script web app. */
function doGet() {
  var html = HtmlService.createHtmlOutputFromFile("index").getContent();
  html = html.replace("/* HHSA_DATA_ASSET */", includeAsset("data"));
  html = html.replace("/* HHSA_MAIN_ASSET */", includeAsset("main"));
  var output = HtmlService.createHtmlOutput(html);
  output.setTitle("HHSA Signal Lab");
  output.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return output;
}

/** Embed sibling browser assets as ordinary inline scripts. */
function includeAsset(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// Master log schema -- APPEND-ONLY. Add new columns at the END only.
var LOG_HEADERS = ["timestamp", "condition", "summary", "note",
                   "docUrl", "pdfUrl", "docxUrl"];

// ------------------------------------------------------------------ auth --

var AUTH_ENABLED = false;   // master switch; flip true to require the passcode
var SESSION_HOURS = 12;
var MAX_ATTEMPTS = 5;       // brute-force lockout per 15 min per client
var LOCKOUT_MINUTES = 15;

function getAuthConfig_() {
  return { enabled: AUTH_ENABLED };
}

function sha256Hex_(str) {
  var bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256, str, Utilities.Charset.UTF_8);
  var hex = "";
  for (var i = 0; i < bytes.length; i++) hex += ("0" + (bytes[i] & 0xFF).toString(16)).slice(-2);
  return hex;
}

function getSalt_() {
  var p = PropertiesService.getScriptProperties();
  var s = p.getProperty("HHSA_SALT");
  if (!s) {
    s = Utilities.getUuid() + Utilities.getUuid();
    p.setProperty("HHSA_SALT", s);
  }
  return s;
}

function getPasscodeHash_() {
  return PropertiesService.getScriptProperties().getProperty("HHSA_PASSCODE_HASH") || "";
}

/** Owner-only: run once from the editor to set/change the passcode. */
function setAppPasscode(newPasscode) {
  PropertiesService.getScriptProperties().setProperty(
    "HHSA_PASSCODE_HASH", sha256Hex_(getSalt_() + "|" + newPasscode));
}

function issueToken_() {
  var exp = new Date().getTime() + SESSION_HOURS * 3600 * 1000;
  return exp + "." + sha256Hex_(getSalt_() + "|" + exp + "|" + getPasscodeHash_());
}

function isValidToken_(token) {
  var parts = String(token || "").split(".");
  if (parts.length !== 2) return false;
  var exp = parseInt(parts[0], 10);
  if (!exp || exp < new Date().getTime()) return false;
  return sha256Hex_(getSalt_() + "|" + exp + "|" + getPasscodeHash_()) === parts[1];
}

function authFail_(token) {
  if (!AUTH_ENABLED) return null;
  if (isValidToken_(token)) return null;
  return { status: "auth_required", message: "登入已逾期，請重新輸入密碼。" };
}

function getAuthConfig() { return getAuthConfig_(); }

function login(passcode) {
  var cache = CacheService.getScriptCache();
  // Coarse per-process failure counter (script cache, not per-client).
  var counterKey = "fail_count";
  var fails = parseInt(cache.get(counterKey) || "0", 10);
  if (fails >= MAX_ATTEMPTS) {
    return { ok: false, message: "嘗試次數過多，請 15 分鐘後再試。" };
  }
  if (sha256Hex_(getSalt_() + "|" + passcode) === getPasscodeHash_()) {
    cache.remove(counterKey);
    return { ok: true, token: issueToken_() };
  }
  cache.put(counterKey, String(fails + 1), LOCKOUT_MINUTES * 60);
  Utilities.sleep(700);   // brute-force resistance
  return { ok: false, message: "密碼錯誤。" };
}

// ------------------------------------------------------------------ data --

function getSpreadsheet() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) return ss;
  } catch (e) {}
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getOrCreateSheet_(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight("bold").setBackground("#1e293b").setFontColor("#f8fafc");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getReportsFolder_() {
  var ss = getSpreadsheet();
  var parent;
  try {
    var f = DriveApp.getFileById(ss.getId());
    parent = f.getParents().hasNext() ? f.getParents().next() : DriveApp.getRootFolder();
  } catch (e) {
    parent = DriveApp.getRootFolder();
  }
  var it = parent.getFoldersByName(REPORT_FOLDER);
  return it.hasNext() ? it.next() : parent.createFolder(REPORT_FOLDER);
}

function docLinks_(docId) {
  return {
    docId: docId,
    docUrl: "https://docs.google.com/document/d/" + docId + "/edit",
    pdfUrl: "https://docs.google.com/document/d/" + docId + "/export?format=pdf",
    docxUrl: "https://docs.google.com/document/d/" + docId + "/export?format=docx"
  };
}

function createReport_(record, timestamp) {
  var folder = getReportsFolder_();
  var doc = DocumentApp.create("HHSA_Demo_" +
    Utilities.formatDate(timestamp, "Asia/Taipei", "yyyyMMdd_HHmm"));
  var body = doc.getBody();
  body.setMarginTop(40).setMarginBottom(40).setMarginLeft(48).setMarginRight(48);

  body.appendParagraph("HHSA 動態刺激器示範 run").setHeading(DocumentApp.Heading.HEADING_1);
  body.appendParagraph(Utilities.formatDate(timestamp, "Asia/Taipei", "yyyy-MM-dd HH:mm:ss"))
    .setForegroundColor("#666666");
  body.appendParagraph("");
  var table = body.appendTable([
    ["condition", record.condition],
    ["summary", record.summary],
    ["note", record.note]
  ]);
  table.setBorderColor("#999999");
  body.appendParagraph("");
  body.appendParagraph("全部輸出為模擬 / marker-only。臨床 signature 來自 NotebookLM notebook 文獻庫。");

  doc.saveAndClose();
  DriveApp.getFileById(doc.getId()).moveTo(folder);
  return docLinks_(doc.getId());
}

// ----------------------------------------------------------- client API --

/**
 * Record one demo run: append to the Sheets master log and generate a report.
 * Token-first convention: the client wrapper injects the token.
 */
function logDemoRun(token, condition, summary, note) {
  var gate = authFail_(token);
  if (gate) return gate;

  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet_(ss, "Master_Log", LOG_HEADERS);
  var ts = new Date();
  var links = createReport_({
    condition: condition, summary: summary, note: note || ""
  }, ts);

  var values = [
    Utilities.formatDate(ts, "Asia/Taipei", "yyyy-MM-dd HH:mm:ss"),
    condition, summary, note || "",
    links.docUrl, links.pdfUrl, links.docxUrl
  ];
  sheet.appendRow(values);
  return { ok: true, row: sheet.getLastRow(), docUrl: links.docUrl,
           pdfUrl: links.pdfUrl, docxUrl: links.docxUrl };
}

/** Owner self-test: exercises the real Google APIs, then cleans up. */
function runSelfTest() {
  var ss = getSpreadsheet();
  var sheet = getOrCreateSheet_(ss, "Master_Log", LOG_HEADERS);
  var links = createReport_({
    condition: "self-test", summary: "runSelfTest()", note: "temp"
  }, new Date());
  DriveApp.getFileById(links.docId).setTrashed(true);
  return { ok: true, sheetRows: sheet.getLastRow(), reportTrashed: true };
}

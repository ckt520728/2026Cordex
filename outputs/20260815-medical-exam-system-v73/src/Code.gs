/**
 * Clinical Documentation & Admission Note System — v7.3
 * 2026 Google Spark x Google Apps Script Cloud Engine
 *
 * Master Log        : Google Sheets (Master_AdmissionNotes / Master_Exams + per-type tabs)
 * Official Reports  : Google Docs (with PDF & Word export URLs)
 * Access Control    : passcode gate + stateless signed session token (see AUTH section)
 *
 * Author: Antigravity AI / Claude Code for Dr. Kwo-Ta Chu
 *
 * IMPORTANT — every client-callable function takes the session `token` as its FIRST
 * argument. Adding a new callable function? Guard it with `authFail_(token)`.
 */

var SPREADSHEET_ID = 'REPLACE_WITH_SPREADSHEET_ID';
var TZ = 'Asia/Taipei';

/**
 * Hospital name printed in the admission-note letterhead (top of the body) and in
 * the slim continuation header. Change this one line to re-brand for another hospital.
 */
var HOSPITAL_NAME = '陽明醫院';

/* ==========================================================================
 * AUTH — passcode gate
 *
 * The passcode is never stored in source. It lives in Script Properties as a
 * salted SHA-256 hash. To change it, open the Apps Script editor, select
 * `setAppPasscode` in the function dropdown, edit NEW_PASSCODE below, Run once.
 *
 * Session tokens are stateless and signed: "<expiryMillis>.<sha256(salt|exp|hash)>".
 * They therefore survive CacheService eviction, and changing the passcode
 * instantly invalidates every outstanding token.
 * ========================================================================== */

/**
 * MASTER SWITCH for the passcode gate.
 *
 *   false — anyone with the link goes straight into the app.
 *   true  — the login screen is shown and every data function requires a valid
 *           token (current setting).
 *
 * ⚠️ ON since 2026-08-12, because the form collects 身分證號碼 and the /exec URL
 * is published in a PUBLIC repo. Do not switch this back to false while the link
 * is shared with staff.
 *
 * ⚠️ REMAINING STEP FOR THE OWNER: until `setAppPasscode` is run once from the
 * editor, the passcode falls back to DEFAULT_PASSCODE below — which is readable
 * in the public repo. Run it to set a real passcode.
 */
var AUTH_ENABLED = true;

var PROP_PASSCODE_HASH = 'APP_PASSCODE_HASH';
var PROP_PASSCODE_SALT = 'APP_PASSCODE_SALT';
var DEFAULT_PASSCODE = 'CHANGE_ME_BEFORE_DEPLOY';          // used only until setAppPasscode() is run
var SESSION_HOURS = 12;
var MAX_FAILED_ATTEMPTS = 8;                  // per 15 min window

/** Client asks this on boot to decide whether to show the login screen. */
function getAuthConfig() {
  return { status: 'success', authEnabled: AUTH_ENABLED };
}

/**
 * Run this manually from the Apps Script editor to change the entry passcode.
 * Edit NEW_PASSCODE, press Run, then check the execution log.
 */
function setAppPasscode() {
  var NEW_PASSCODE = 'CHANGE_ME_BEFORE_DEPLOY';

  if (!NEW_PASSCODE || NEW_PASSCODE === 'CHANGE_ME_BEFORE_DEPLOY') {
    Logger.log('❌ 請先把 NEW_PASSCODE 改成你要的密碼，再按 Run。');
    return;
  }
  if (NEW_PASSCODE.length < 6) {
    Logger.log('❌ 密碼太短，請至少 6 個字元。');
    return;
  }
  var props = PropertiesService.getScriptProperties();
  props.setProperty(PROP_PASSCODE_HASH, sha256Hex_(getSalt_() + '::' + NEW_PASSCODE));
  Logger.log('✅ 密碼已更新。所有已登入的裝置會立刻登出，需要用新密碼重新進入。');
}

function sha256Hex_(str) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, str, Utilities.Charset.UTF_8);
  var hex = '';
  for (var i = 0; i < bytes.length; i++) {
    hex += ('0' + (bytes[i] & 0xFF).toString(16)).slice(-2);
  }
  return hex;
}

function getSalt_() {
  var props = PropertiesService.getScriptProperties();
  var salt = props.getProperty(PROP_PASSCODE_SALT);
  if (!salt) {
    salt = Utilities.getUuid();
    props.setProperty(PROP_PASSCODE_SALT, salt);
  }
  return salt;
}

function getPasscodeHash_() {
  var props = PropertiesService.getScriptProperties();
  var hash = props.getProperty(PROP_PASSCODE_HASH);
  if (!hash) {
    if (!DEFAULT_PASSCODE || DEFAULT_PASSCODE === 'CHANGE_ME_BEFORE_DEPLOY') {
      throw new Error('PASSCODE_NOT_CONFIGURED');
    }
    hash = sha256Hex_(getSalt_() + '::' + DEFAULT_PASSCODE);
    props.setProperty(PROP_PASSCODE_HASH, hash);
  }
  return hash;
}

function issueToken_() {
  var exp = new Date().getTime() + SESSION_HOURS * 3600 * 1000;
  return exp + '.' + sha256Hex_(getSalt_() + '|' + exp + '|' + getPasscodeHash_());
}

function isValidToken_(token) {
  if (!token) return false;
  var parts = String(token).split('.');
  if (parts.length !== 2) return false;
  var exp = parseInt(parts[0], 10);
  if (!exp || exp < new Date().getTime()) return false;
  return sha256Hex_(getSalt_() + '|' + exp + '|' + getPasscodeHash_()) === parts[1];
}

/** Returns an error envelope when the token is bad, otherwise null. */
function authFail_(token) {
  if (!AUTH_ENABLED) return null;
  if (isValidToken_(token)) return null;
  return { status: 'auth_required', message: '登入已逾期，請重新輸入密碼。' };
}

function attemptKey_() {
  var who = '';
  try { who = Session.getTemporaryActiveUserKey() || ''; } catch (e) {}
  return 'login_fail_' + (who || 'anon');
}

/**
 * Client entry point for the login screen.
 * @param {string} passcode
 * @return {{status:string, token:(string|undefined), expiresAt:(number|undefined), message:(string|undefined)}}
 */
function authenticate(passcode) {
  if (!AUTH_ENABLED) {
    return { status: 'success', token: '', expiresAt: 0, message: '密碼保護目前為關閉狀態' };
  }
  var cache = CacheService.getScriptCache();
  var key = attemptKey_();
  var fails = parseInt(cache.get(key) || '0', 10);

  if (fails >= MAX_FAILED_ATTEMPTS) {
    return { status: 'error', message: '嘗試次數過多，請等 15 分鐘後再試。' };
  }

  if (sha256Hex_(getSalt_() + '::' + String(passcode || '')) !== getPasscodeHash_()) {
    cache.put(key, String(fails + 1), 900);
    Utilities.sleep(700); // slow down brute force
    return { status: 'error', message: '密碼不正確。' };
  }

  cache.remove(key);
  var token = issueToken_();
  return {
    status: 'success',
    token: token,
    expiresAt: parseInt(token.split('.')[0], 10),
    message: '登入成功'
  };
}

/** Lets a returning browser confirm a stored token is still good. */
function verifySession(token) {
  if (!AUTH_ENABLED) return { status: 'success', expiresAt: 0 };
  return isValidToken_(token)
    ? { status: 'success', expiresAt: parseInt(String(token).split('.')[0], 10) }
    : { status: 'auth_required' };
}

/* ==========================================================================
 * INFRASTRUCTURE
 * ========================================================================== */

function getSpreadsheet() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) return ss;
  } catch (e) {}
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('臨床醫療紀錄與報告系統 | Clinical Documentation System')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Get or create a sheet tab. Headers are only written when the tab is brand new,
 * so existing logs keep their column order — append new columns at the END of
 * the header array, never in the middle.
 */
function getOrCreateSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#1e293b')
      .setFontColor('#f8fafc');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** Resolve the Drive folder that holds this project's generated reports. */
function getReportsFolder_(folderName) {
  var ss = getSpreadsheet();
  var ssFile = DriveApp.getFileById(ss.getId());
  var parentFolder = ssFile.getParents().hasNext() ? ssFile.getParents().next() : DriveApp.getRootFolder();
  var it = parentFolder.getFoldersByName(folderName);
  return it.hasNext() ? it.next() : parentFolder.createFolder(folderName);
}

function docLinks_(docId) {
  return {
    docId: docId,
    docUrl: 'https://docs.google.com/document/d/' + docId + '/edit',
    pdfUrl: 'https://docs.google.com/document/d/' + docId + '/export?format=pdf',
    docxUrl: 'https://docs.google.com/document/d/' + docId + '/export?format=docx'
  };
}

function getSheetNameForType(examType) {
  switch (examType) {
    case 'Echocardiogram': return '心臟超音波_Echo';
    case 'Abdominal Sonography': return '腹部超音波_AbdominalSono';
    case 'UGI Endoscopy': return '上消化道內視鏡_UGI';
    case 'LGI Endoscopy': return '下消化道內視鏡_LGI';
    default: return '其他檢查_Other';
  }
}

/* ==========================================================================
 * CLINICAL EXAM REPORTS
 * ========================================================================== */

/**
 * Save an examination record: Sheets log + Google Doc + PDF/Word links.
 * @param {string} token session token
 * @param {Object} record
 */
function saveExamRecord(token, record) {
  var gate = authFail_(token);
  if (gate) return gate;

  try {
    var ss = getSpreadsheet();
    var timestamp = new Date();
    var examId = 'EXAM-' + Utilities.formatDate(timestamp, TZ, 'yyyyMMdd-HHmmss');

    record = record || {};
    var examType = record.examType || 'Unspecified';
    var doctorName = record.doctorName || '朱國大醫師 (Dr. Kwo-Ta Chu)';
    var examDate = record.examDate || Utilities.formatDate(timestamp, TZ, 'yyyy-MM-dd');
    var patientId = record.patientId || 'ANON-' + Math.floor(1000 + Math.random() * 9000);
    var patientName = record.patientName || '';
    var symptoms = record.symptoms || '';
    var diagnosis = record.diagnosis || '';
    var findings = record.findings || '';
    var impression = record.impression || '';
    var recommendation = record.recommendation || '';
    var indication = record.indication || '';
    var technique = record.technique || '';
    var comparison = record.comparison || '';
    var rawStructuredData = JSON.stringify(record.structuredDetails || {});

    // Header fields on the hospital's printed exam form. All optional — a blank
    // prints as a blank label, the way 送檢單位 / 報告時間 are blank on the paper
    // form, rather than being filled in with a guess.
    var birthDate = record.birthDate || '';
    var patientAge = record.patientAge || '';
    var gender = record.gender || '';
    var payerStatus = record.payerStatus || '';
    var department = record.department || '';
    var examTime = record.examTime || '';
    var patientSource = record.patientSource || '';
    var requestingUnit = record.requestingUnit || '';
    var licenseNo = record.licenseNo || '';

    var docResult = createGoogleDocReport(record, examId, timestamp);

    // Columns 1-15 are the v5.0 layout and MUST stay in place; 16-19 are v6.0
    // additions; 20-28 arrived with the hospital-form report layout.
    // Append only — never insert. See CLAUDE.md constraint 2.
    var masterHeaders = [
      '檢查編號 (Exam ID)', '登錄時間 (Timestamp)', '檢查日期 (Exam Date)', '檢查項目 (Exam Type)',
      '操作醫師 (Operator Doctor)', '病歷代碼 (Patient Code)', '臨床症狀 (Clinical Symptoms)',
      '初步診斷 (Tentative Diagnosis)', '影像所見 (Image Findings)', '檢查結論 (Impression)',
      '建議與處置 (Recommendations)', 'Google Doc 報告網址', 'PDF 下載網址', 'Word 下載網址',
      '明細數據 JSON',
      '病患姓名 (Patient Name)', '臨床適應症 (Indication)', '檢查技術 (Technique)', '比較影像 (Comparison)',
      '出生日期 (Birth Date)', '年齡 (Age)', '性別 (Sex)', '身份別 (Payer Status)', '科別 (Department)',
      '檢查時間 (Exam Time)', '患者來源 (Patient Source)', '送檢單位 (Requesting Unit)', '執照號碼 (License No.)'
    ];

    var masterSheet = getOrCreateSheet(ss, 'Master_Exams', masterHeaders);
    masterSheet.appendRow([
      examId, timestamp, examDate, examType, doctorName, patientId, symptoms, diagnosis,
      findings, impression, recommendation,
      docResult.docUrl, docResult.pdfUrl, docResult.docxUrl, rawStructuredData,
      patientName, indication, technique, comparison,
      birthDate, patientAge, gender, payerStatus, department,
      examTime, patientSource, requestingUnit, licenseNo
    ]);

    var specificHeaders = [
      '檢查編號', '登錄時間', '檢查日期', '操作醫師', '病歷代碼',
      '臨床症狀與診斷', '影像所見與結果', '檢查結論與處置建議',
      'Google Doc 連結', 'PDF 下載連結', 'Word 下載連結'
    ];
    var specificSheet = getOrCreateSheet(ss, getSheetNameForType(examType), specificHeaders);
    specificSheet.appendRow([
      examId, timestamp, examDate, doctorName, patientId,
      '症狀: ' + symptoms + ' | 診斷: ' + diagnosis,
      findings,
      '結論: ' + impression + ' | 處置: ' + recommendation,
      docResult.docUrl, docResult.pdfUrl, docResult.docxUrl
    ]);

    return {
      status: 'success',
      examId: examId,
      docUrl: docResult.docUrl,
      pdfUrl: docResult.pdfUrl,
      docxUrl: docResult.docxUrl,
      message: '檢查紀錄已登錄至試算表流水帳，並已生成正式 Google Doc / PDF / Word 報告！'
    };
  } catch (err) {
    return { status: 'error', message: '儲存失敗：' + err.toString() };
  }
}

/**
 * Generate the formal Google Doc exam report.
 *
 * Layout mirrors 陽明醫院's printed exam-report form (see
 * 02_參考資料/Admission Note_format/Image_exam_format_1.jpg): a three-column
 * letterhead line, a four-line demographic block, S/O clinical information,
 * then Clinical Diagnosis → Exam Item → Report Content → signature footer.
 *
 * The RSNA structured order is preserved *inside* that skeleton — indication and
 * technique/comparison sit under O, findings under Report Content, and
 * Impression/Recommendation follow as their own sections.
 *
 * The centred << … >> title is per exam type (see examReportTitle_), so an
 * echo report never prints an endoscopy heading.
 */
function createGoogleDocReport(record, examId, timestamp) {
  var reportsFolder = getReportsFolder_('臨床檢查報告_GoogleDocs');

  var docTitle = '臨床檢查報告_' + String(record.examType || 'Exam').replace(/\s+/g, '_') +
    '_' + (record.patientId || 'ANON') + '_' + Utilities.formatDate(timestamp, TZ, 'yyyyMMdd_HHmm');
  var doc = DocumentApp.create(docTitle);
  var body = doc.getBody();

  body.setMarginTop(40).setMarginBottom(40).setMarginLeft(48).setMarginRight(48);

  buildExamLetterhead_(body, record);

  // Demographic block — space-padded monospace lines, as printed on the form.
  // Columns line up only because appendExamLine_ uses a fixed-width face.
  appendExamLine_(body, padTo_('Chart No. : ' + (record.patientId || ''), 34) +
    'Name : ' + (record.patientName || ''), 0);
  appendExamLine_(body, padTo_('Age : ' + (record.patientAge || ''), 16) +
    padTo_('Birth Date : ' + toRocBirth_(record.birthDate), 34) +
    'Sex : ' + (record.gender || ''), 0);
  appendExamLine_(body, padTo_('Dept. : ' + (record.department || ''), 46) +
    'Status : ' + (record.payerStatus || ''), 0);
  appendExamLine_(body, padTo_('Exam Date : ' + toRocSlash_(record.examDate), 26) +
    padTo_('Exam Time : ' + (record.examTime || ''), 24) +
    'Source : ' + (record.patientSource || ''), 0);

  // A blank line, not a rule: the paper form separates the header block from the
  // S/O text with whitespace only.
  appendExamLine_(body, '', 0).setSpacingBefore(8);

  // S / O — the clinical information the study was requested on, in the form's
  // own shorthand. Technique and comparison are objective study parameters, so
  // they are continuation lines under O rather than sections of their own.
  appendExamLine_(body, 'S : ' + (record.symptoms || '—'), 0);
  appendExamLine_(body, 'O : Indication  : ' + (record.indication || record.symptoms || '—'), 0);
  appendExamLine_(body, 'Technique   : ' + (record.technique || 'Per standard departmental protocol.'), 28);
  appendExamLine_(body, 'Comparison  : ' + (record.comparison || 'No prior study available for comparison.'), 28);

  appendExamSection_(body, 'Clinical Diagnosis');
  appendExamBlock_(body, record.diagnosis);

  appendExamSection_(body, 'Exam Item');
  appendExamLine_(body, examItemLabel_(record.examType));

  appendExamSection_(body, 'Report Content');
  appendExamBlock_(body, record.findings || 'No specific finding recorded.');

  appendExamSection_(body, 'Impression');
  appendExamBlock_(body, record.impression || 'No significant abnormality.');

  appendExamSection_(body, 'Recommendation');
  appendExamBlock_(body, record.recommendation || 'Routine clinical follow-up.');

  // Signature footer — the same three lines as the bottom of the paper form.
  appendExamLine_(body, '', 0).setSpacingBefore(16);
  appendExamLine_(body, 'Reporting Physician  : ' + (record.doctorName || ''), 0);
  appendExamLine_(body, padTo_('Specialist Physician : ' + (record.doctorName || ''), 54) +
    'License No. : ' + (record.licenseNo || ''), 0);
  appendExamLine_(body, padTo_('Report Date : ' + toRocSlash_(timestamp), 26) +
    'Report Time : ' + Utilities.formatDate(timestamp, TZ, 'HH:mm'), 0);

  styleP_(body.appendParagraph('Exam ID: ' + examId + '　|　' +
    Utilities.formatDate(timestamp, TZ, 'yyyy-MM-dd HH:mm')), { size: 8, before: 12 })
    .setForegroundColor('#808080');

  // DocumentApp.create() seeds the body with one empty paragraph that would push
  // the letterhead down a line. Cosmetic — never let it fail the whole report.
  try {
    var seed = body.getChild(0);
    if (body.getNumChildren() > 1 &&
        seed.getType() === DocumentApp.ElementType.PARAGRAPH &&
        seed.asParagraph().getText() === '') {
      seed.removeFromParent();
    }
  } catch (e) {
    logDiagnostic_('createGoogleDocReport/removeSeedParagraph', e);
  }

  doc.saveAndClose();
  DriveApp.getFileById(doc.getId()).moveTo(reportsFolder);
  return docLinks_(doc.getId());
}

/* --------------------------------------------------------------------------
 * Hospital exam-report formatting helpers
 *
 * The paper form has no large titles — 臨床診斷／檢查項目／報告內容 are printed
 * at the same size as the text under them, on a fixed-width printer. So section
 * labels here are body size + bold, NOT Doc headings, and every body line uses
 * one monospace face. Promoting a label to a real heading, or mixing in a
 * proportional font, breaks both the resemblance and the padded columns.
 * -------------------------------------------------------------------------- */

var EXAM_DOC_FONT = 'Consolas';
var EXAM_DOC_SIZE = 10;

/** Centred << … >> title, one per exam type the web app offers. */
function examReportTitle_(examType) {
  switch (examType) {
    case 'Echocardiogram': return 'ECHOCARDIOGRAPHY REPORT';
    case 'Abdominal Sonography': return 'ABDOMINAL SONOGRAPHY REPORT';
    case 'UGI Endoscopy': return 'UGI ENDOSCOPY REPORT';
    case 'LGI Endoscopy': return 'LGI ENDOSCOPY REPORT';
    default: return 'EXAMINATION REPORT';
  }
}

/** The Exam Item line — English name with the Chinese one shown on the picker. */
function examItemLabel_(examType) {
  switch (examType) {
    case 'Echocardiogram': return 'Echocardiogram (心臟超音波)';
    case 'Abdominal Sonography': return 'Abdominal Sonography (腹部超音波)';
    case 'UGI Endoscopy': return 'UGI Endoscopy (上消化道內視鏡)';
    case 'LGI Endoscopy': return 'LGI Endoscopy (下消化道內視鏡)';
    default: return String(examType || 'Unspecified');
  }
}

/**
 * Display width in fixed-width columns: full-width CJK counts as two.
 * Without this a Chinese patient name throws every later column out of line.
 */
function dispWidth_(text) {
  var s = String(text == null ? '' : text);
  var w = 0;
  for (var i = 0; i < s.length; i++) {
    w += /[ᄀ-ᅟ⺀-〾ぁ-㏿㐀-䶿一-鿿ꀀ-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]/
      .test(s.charAt(i)) ? 2 : 1;
  }
  return w;
}

/** Right-pad to a column width; never truncates, so long values just push over. */
function padTo_(text, width) {
  var out = String(text == null ? '' : text);
  while (dispWidth_(out) < width) out += ' ';
  return out;
}

/**
 * ROC calendar in the form's slash notation: 2026-08-13 → 115/08/13.
 * Accepts an ISO string, a Date, or text already in ROC form.
 */
function toRocSlash_(value) {
  if (!value) return '';
  var s = String(value).trim();
  if (/^\d{2,3}\/\d{1,2}\/\d{1,2}$/.test(s)) return s;
  var d = (value instanceof Date) ? value : new Date(s.length <= 10 ? s + 'T00:00:00' : s);
  if (isNaN(d.getTime())) return s;
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  return (d.getFullYear() - 1911) + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate());
}

/**
 * Birth date as the form prints it: 民國040/01/01.
 * Accepts 0400101, 040/01/01 or 1951-01-01. Anything else is passed through
 * unchanged rather than guessed at — a wrong birth date is worse than a raw one.
 */
function toRocBirth_(value) {
  var s = String(value == null ? '' : value).trim();
  if (!s) return '';
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };

  var west = s.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
  if (west) {
    return '民國' + ('00' + (Number(west[1]) - 1911)).slice(-3) +
      '/' + pad(Number(west[2])) + '/' + pad(Number(west[3]));
  }
  if (/^民國/.test(s)) return s;

  var digits = s.replace(/[^0-9]/g, '');
  if (digits.length === 7) {
    return '民國' + digits.slice(0, 3) + '/' + digits.slice(3, 5) + '/' + digits.slice(5, 7);
  }
  return s;
}

/**
 * The three-column letterhead line: hospital / << TITLE >> / requesting unit.
 * A borderless table, because a paragraph cannot be left, centre and right
 * aligned at once. It lives in the BODY, not the page header — Google Docs
 * drops tables from headers when exporting to .docx (see
 * buildAdmissionLetterhead_ for the incident this rule came from).
 */
function buildExamLetterhead_(body, record) {
  var table = body.appendTable([['', '', '']]);
  table.setBorderWidth(0);

  setCellLines_(table.getCell(0, 0), [
    { text: HOSPITAL_NAME, size: 11, bold: true, align: DocumentApp.HorizontalAlignment.LEFT }
  ]);
  setCellLines_(table.getCell(0, 1), [
    { text: '<< ' + examReportTitle_(record.examType) + ' >>', size: 12, bold: true,
      align: DocumentApp.HorizontalAlignment.CENTER }
  ]);
  setCellLines_(table.getCell(0, 2), [
    { text: 'Requesting Unit : ' + (record.requestingUnit || ''), size: 9,
      align: DocumentApp.HorizontalAlignment.RIGHT }
  ]);

  table.setColumnWidth(0, 96).setColumnWidth(1, 288).setColumnWidth(2, 132);
  return table;
}

/** Section label: body size, bold, no colour — exactly as the form prints it. */
function appendExamSection_(body, label) {
  return styleP_(body.appendParagraph(label + ' :'),
    { size: EXAM_DOC_SIZE, bold: true, before: 10, after: 2 })
    .setFontFamily(EXAM_DOC_FONT);
}

/** One monospace body line. Pass indent 0 for the space-padded column lines. */
function appendExamLine_(body, text, indent) {
  var p = styleP_(body.appendParagraph(String(text == null ? '' : text)), { size: EXAM_DOC_SIZE });
  p.setFontFamily(EXAM_DOC_FONT).setIndentStart(indent == null ? 24 : indent);
  return p;
}

/**
 * A multi-line value, one paragraph per line, so the leading spaces the
 * templates use for sub-items survive. Leading blank lines are dropped;
 * an empty value prints the form's em-dash rather than nothing.
 */
function appendExamBlock_(body, text, indent) {
  var lines = String(text == null ? '' : text).split('\n');
  var printed = 0;
  for (var i = 0; i < lines.length; i++) {
    if (!lines[i].trim() && !printed) continue;
    appendExamLine_(body, lines[i].replace(/\s+$/, ''), indent);
    printed++;
  }
  if (!printed) appendExamLine_(body, '—', indent);
}

/**
 * Recent exam records + dashboard counters.
 * @param {string} token
 * @param {number} limit
 */
function getRecentRecords(token, limit) {
  var gate = authFail_(token);
  if (gate) return gate;

  try {
    limit = limit || 20;
    var ss = getSpreadsheet();
    var masterSheet = ss.getSheetByName('Master_Exams');
    var empty = { status: 'success', records: [], stats: { total: 0, echo: 0, sono: 0, ugi: 0, lgi: 0 } };
    if (!masterSheet) return empty;

    var data = masterSheet.getDataRange().getValues();
    if (data.length <= 1) return empty;

    var records = [];
    var stats = { total: data.length - 1, echo: 0, sono: 0, ugi: 0, lgi: 0 };

    for (var i = data.length - 1; i >= 1; i--) {
      var row = data[i];
      var type = row[3];
      if (type === 'Echocardiogram') stats.echo++;
      else if (type === 'Abdominal Sonography') stats.sono++;
      else if (type === 'UGI Endoscopy') stats.ugi++;
      else if (type === 'LGI Endoscopy') stats.lgi++;
      if (records.length < limit) records.push(mapExamRow_(row));
    }
    return { status: 'success', records: records, stats: stats };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}

/**
 * Parse a date cell without allowing one malformed historical row to abort the
 * whole Dashboard. Supports Date objects, ISO dates and ROC dates.
 */
function parseRecordDate_(value) {
  if (!value) return null;
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return isNaN(value.getTime()) ? null : value;
  }

  var text = String(value).trim();
  var match = text.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/);
  var year;
  var month;
  var day;
  if (match) {
    year = Number(match[1]);
    month = Number(match[2]);
    day = Number(match[3]);
  } else {
    match = text.match(/^(\d{2,3})[-\/.](\d{1,2})[-\/.](\d{1,2})/);
    if (match) {
      year = Number(match[1]) + 1911;
      month = Number(match[2]);
      day = Number(match[3]);
    }
  }

  if (year) {
    var exact = new Date(year, month - 1, day);
    if (exact.getFullYear() === year && exact.getMonth() === month - 1 && exact.getDate() === day) {
      return exact;
    }
    return null;
  }

  var parsed = new Date(text);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function formatRecordDate_(value, pattern) {
  if (!value) return '';
  var parsed = parseRecordDate_(value);
  return parsed ? Utilities.formatDate(parsed, TZ, pattern) : String(value).trim();
}

function recordDateKey_(value) {
  var parsed = parseRecordDate_(value);
  return parsed ? Utilities.formatDate(parsed, TZ, 'yyyy-MM-dd') : '';
}

function normalizeExamType_(value) {
  var type = String(value || '').trim();
  if (/echo|心臟超音波/i.test(type)) return 'Echocardiogram';
  if (/abdominal|sono|腹部超音波/i.test(type)) return 'Abdominal Sonography';
  if (/ugi|胃鏡|upper gi/i.test(type)) return 'UGI Endoscopy';
  if (/lgi|大腸鏡|colon/i.test(type)) return 'LGI Endoscopy';
  return type || 'Unspecified';
}

/** 將異質資料列投影成總表可用的固定 facet。 */
function dashboardRecordType_(record) {
  if (record.recordKind === 'adm') return 'admission';
  var type = normalizeExamType_(record.examType);
  if (type === 'Echocardiogram') return 'echo';
  if (type === 'Abdominal Sonography') return 'sono';
  if (type === 'UGI Endoscopy') return 'ugi';
  if (type === 'LGI Endoscopy') return 'lgi';
  return 'other';
}

function dashboardRecordTypeLabel_(type) {
  return ({
    all: '全部紀錄（住院病歷＋檢查報告）',
    admission: '住院病歷',
    exam: '全部檢查報告',
    echo: '心臟超音波',
    sono: '腹部超音波',
    ugi: '胃鏡 UGI',
    lgi: '大腸鏡 LGI'
  })[String(type || 'all')] || '其他檢查';
}

function dashboardRecordMatches_(record, filters) {
  filters = filters || {};
  var query = String(filters.query || '').toLowerCase().trim();
  var doctor = String(filters.doctor || '').toLowerCase().trim();
  var recordType = String(filters.recordType || '').trim();
  // 相容 v7.2 舊前端；新前端只送 recordType。
  if (!recordType && filters.tab === 'adm') recordType = 'admission';
  if (!recordType && filters.tab === 'exam') {
    var legacyExamType = String(filters.examType || '').trim();
    recordType = legacyExamType && legacyExamType !== 'all'
      ? dashboardRecordType_({ recordKind: 'exam', examType: legacyExamType })
      : 'exam';
  }
  var dateKey = recordDateKey_(record.examDate);

  if (doctor && String(record.doctorName || '').toLowerCase().indexOf(doctor) === -1) return false;
  if (filters.startDate && (!dateKey || dateKey < filters.startDate)) return false;
  if (filters.endDate && (!dateKey || dateKey > filters.endDate)) return false;
  if (recordType && recordType !== 'all') {
    if (recordType === 'exam' && record.recordKind !== 'exam') return false;
    if (recordType !== 'exam' && dashboardRecordType_(record) !== recordType) return false;
  }

  if (query) {
    var haystack = [
      record.examId, record.noteId, record.examDate, record.examType,
      record.doctorName, record.patientId, record.patientName,
      record.diagnosis, record.impression, record.chiefComplaint,
      record.presentIllness
    ].join(' ').toLowerCase();
    if (haystack.indexOf(query) === -1) return false;
  }
  return true;
}

function dashboardCounts_(records) {
  var stats = {
    total: records.length,
    admissions: 0,
    exams: 0,
    echo: 0,
    sono: 0,
    ugi: 0,
    lgi: 0,
    other: 0
  };
  records.forEach(function (record) {
    var type = dashboardRecordType_(record);
    if (type === 'admission') stats.admissions++;
    else {
      stats.exams++;
      if (Object.prototype.hasOwnProperty.call(stats, type)) stats[type]++;
      else stats.other++;
    }
  });
  return stats;
}

function collectDashboardRecords_(filters) {
  var ss = getSpreadsheet();
  var exams = [];
  var admissions = [];
  var examSheet = ss.getSheetByName('Master_Exams');
  var admissionSheet = ss.getSheetByName('Master_AdmissionNotes');

  if (examSheet) {
    var examData = examSheet.getDataRange().getValues();
    for (var i = examData.length - 1; i >= 1; i--) {
      var exam = mapExamRow_(examData[i]);
      exam.recordKind = 'exam';
      exam.recordType = '檢查報告';
      exam.examType = normalizeExamType_(exam.examType);
      exams.push(exam);
    }
  }

  if (admissionSheet) {
    var admissionData = admissionSheet.getDataRange().getValues();
    for (var j = admissionData.length - 1; j >= 1; j--) {
      var admission = mapAdmissionRow_(admissionData[j]);
      admission.recordKind = 'adm';
      admission.recordType = '住院病歷';
      admissions.push(admission);
    }
  }

  var all = exams.concat(admissions);
  var filtered = all.filter(function (record) { return dashboardRecordMatches_(record, filters); });
  filtered.sort(function (a, b) {
    var left = String(a.examDate || '') + ' ' + String(a.timestamp || '');
    var right = String(b.examDate || '') + ' ' + String(b.timestamp || '');
    return right.localeCompare(left);
  });
  var filteredExams = filtered.filter(function (record) { return record.recordKind === 'exam'; });
  var filteredAdmissions = filtered.filter(function (record) { return record.recordKind === 'adm'; });
  var doctorMap = {};
  all.forEach(function (record) {
    var name = String(record.doctorName || '').trim();
    if (name) doctorMap[name] = true;
  });

  return {
    records: filtered,
    exams: filteredExams,
    admissions: filteredAdmissions,
    stats: dashboardCounts_(all),
    filteredStats: dashboardCounts_(filtered),
    doctors: Object.keys(doctorMap).sort()
  };
}

/**
 * Unified Dashboard endpoint. A dirty historical row returns its raw date text
 * instead of trapping the page in a permanent loading state.
 */
function getRecordDashboard(token, filters, limit) {
  var gate = authFail_(token);
  if (gate) return gate;

  try {
    filters = filters || {};
    limit = Math.max(1, Math.min(Number(limit) || 100, 500));
    var data = collectDashboardRecords_(filters);
    return {
      status: 'success',
      contractVersion: 'dashboard.v2',
      requestId: 'dash-' + new Date().getTime(),
      generatedAt: Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss'),
      records: data.records.slice(0, limit),
      filteredCount: data.records.length,
      stats: data.stats,
      filteredStats: data.filteredStats,
      appliedFilters: {
        queryApplied: !!String(filters.query || '').trim(),
        doctor: String(filters.doctor || '').trim(),
        startDate: String(filters.startDate || ''),
        endDate: String(filters.endDate || ''),
        recordType: String(filters.recordType || 'all')
      },
      filterOptions: { doctors: data.doctors }
    };
  } catch (err) {
    logDiagnostic_('getRecordDashboard', err);
    return { status: 'error', message: '讀取紀錄總表失敗：' + err.toString() };
  }
}

/** Neutralize values that Excel could interpret as formulas. */
function spreadsheetSafeCell_(value) {
  var text = String(value == null ? '' : value);
  return /^\s*[=+\-@]/.test(text) ? String.fromCharCode(39) + text : text;
}

/**
 * Export a PHI-minimized Excel summary using the same filters as Dashboard.
 * Patient name, MRN and national ID are deliberately excluded by default.
 */
function exportRecordSummaryXlsx(token, filters) {
  var gate = authFail_(token);
  if (gate) return gate;

  try {
    filters = filters || {};
    var data = collectDashboardRecords_(filters);
    // 與畫面使用同一份 unified、已篩選、已排序的 record list。
    var records = data.records;
    if (filters.expectedCount != null &&
        Number(filters.expectedCount) !== records.length) {
      return {
        status: 'stale',
        message: '紀錄已更新：預覽為 ' + Number(filters.expectedCount) +
          ' 筆，目前為 ' + records.length + ' 筆。請重新整理後再匯出。',
        expectedCount: Number(filters.expectedCount),
        currentCount: records.length
      };
    }
    var now = new Date();
    var fileName = '臨床紀錄統計_' + Utilities.formatDate(now, TZ, 'yyyyMMdd_HHmmss');
    var report = SpreadsheetApp.create(fileName);
    var summarySheet = report.getSheets()[0];
    summarySheet.setName('統計摘要');

    var typeCounts = { admission: 0, echo: 0, sono: 0, ugi: 0, lgi: 0, other: 0 };
    records.forEach(function (record) {
      if (record.recordKind === 'adm') typeCounts.admission++;
      else if (record.examType === 'Echocardiogram') typeCounts.echo++;
      else if (record.examType === 'Abdominal Sonography') typeCounts.sono++;
      else if (record.examType === 'UGI Endoscopy') typeCounts.ugi++;
      else if (record.examType === 'LGI Endoscopy') typeCounts.lgi++;
      else typeCounts.other++;
    });

    var summaryRows = [
      ['臨床紀錄統計報表', ''],
      ['產出時間（Asia/Taipei）', Utilities.formatDate(now, TZ, 'yyyy-MM-dd HH:mm:ss')],
      ['報表範圍', dashboardRecordTypeLabel_(filters.recordType)],
      ['起始日期（含）', spreadsheetSafeCell_(filters.startDate || '未限制')],
      ['結束日期（含）', spreadsheetSafeCell_(filters.endDate || '未限制')],
      ['主治／操作醫師', spreadsheetSafeCell_(filters.doctor || '全部')],
      ['關鍵字', filters.query ? '已套用（內容不寫入報表）' : '未指定'],
      ['符合筆數', records.length],
      ['住院病歷', typeCounts.admission],
      ['心臟超音波', typeCounts.echo],
      ['腹部超音波', typeCounts.sono],
      ['胃鏡 UGI', typeCounts.ugi],
      ['大腸鏡 LGI', typeCounts.lgi],
      ['其他檢查', typeCounts.other]
    ];
    summarySheet.getRange(1, 1, summaryRows.length, 2).setValues(summaryRows);
    summarySheet.setFrozenRows(1);
    summarySheet.autoResizeColumns(1, 2);

    var detailSheet = report.insertSheet('紀錄明細（已去識別）');
    var detailRows = [['紀錄編號', '日期', '文件類型', '檢查類型', '主治／操作醫師', '狀態']];
    records.forEach(function (record) {
      detailRows.push([
        spreadsheetSafeCell_(record.examId || record.noteId),
        spreadsheetSafeCell_(record.examDate),
        spreadsheetSafeCell_(record.recordType),
        spreadsheetSafeCell_(record.recordKind === 'exam' ? record.examType : ''),
        spreadsheetSafeCell_(record.doctorName),
        '已建立'
      ]);
    });
    detailSheet.getRange(1, 1, detailRows.length, detailRows[0].length).setValues(detailRows);
    detailSheet.setFrozenRows(1);
    detailSheet.autoResizeColumns(1, detailRows[0].length);

    SpreadsheetApp.flush();
    var file = DriveApp.getFileById(report.getId());
    file.moveTo(getReportsFolder_('臨床紀錄統計報表'));
    return {
      status: 'success',
      message: 'Excel 統計報表已建立，共 ' + records.length + ' 筆（明細預設去識別）。',
      count: records.length,
      sheetUrl: report.getUrl(),
      xlsxUrl: 'https://docs.google.com/spreadsheets/d/' + report.getId() + '/export?format=xlsx'
    };
  } catch (err) {
    logDiagnostic_('exportRecordSummaryXlsx', err);
    return { status: 'error', message: 'Excel 統計報表產生失敗：' + err.toString() };
  }
}

function mapExamRow_(row) {
  return {
    examId: row[0],
    timestamp: formatRecordDate_(row[1], 'yyyy-MM-dd HH:mm'),
    examDate: formatRecordDate_(row[2], 'yyyy-MM-dd'),
    examType: row[3],
    doctorName: row[4],
    patientId: row[5],
    symptoms: row[6],
    diagnosis: row[7],
    findings: row[8],
    impression: row[9],
    recommendation: row[10],
    docUrl: row[11],
    pdfUrl: row[12],
    docxUrl: row[13],
    patientName: row[15] || '',
    indication: row[16] || '',
    technique: row[17] || '',
    comparison: row[18] || '',
    // Hospital-form header fields. Rows saved before the layout change have no
    // such columns, so these read back as ''.
    // google.script.run 不接受 Date（即使包在物件內）；一律轉成 RPC-safe 字串。
    birthDate: formatRecordDate_(row[19], 'yyyy-MM-dd'),
    patientAge: row[20] || '',
    gender: row[21] || '',
    payerStatus: row[22] || '',
    department: row[23] || '',
    // time-formatted Sheet cells are Date objects too; keep RPC payload primitive-only.
    examTime: formatRecordDate_(row[24], 'HH:mm'),
    patientSource: row[25] || '',
    requestingUnit: row[26] || '',
    licenseNo: row[27] || ''
  };
}

/**
 * Keyword search across exam records.
 * @param {string} token
 * @param {string} query
 */
function searchRecords(token, query) {
  var gate = authFail_(token);
  if (gate) return gate;

  try {
    query = (query || '').toLowerCase().trim();
    var ss = getSpreadsheet();
    var masterSheet = ss.getSheetByName('Master_Exams');
    if (!masterSheet) return { status: 'success', records: [] };

    var data = masterSheet.getDataRange().getValues();
    var results = [];

    for (var i = data.length - 1; i >= 1; i--) {
      var row = data[i];
      var searchStr = (row[0] + ' ' + row[2] + ' ' + row[3] + ' ' + row[4] + ' ' + row[5] + ' ' +
        row[6] + ' ' + row[7] + ' ' + row[8] + ' ' + row[9] + ' ' + (row[15] || '')).toLowerCase();
      if (!query || searchStr.indexOf(query) !== -1) results.push(mapExamRow_(row));
      if (results.length >= 50) break;
    }
    return { status: 'success', records: results };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}

/* ==========================================================================
 * TRANSLATION
 * ========================================================================== */

/**
 * Translate Chinese clinical dictation into English via the built-in LanguageApp.
 * @param {string} token
 * @param {string} text
 */
function translateChineseToEnglish(token, text) {
  var gate = authFail_(token);
  if (gate) return gate;

  try {
    if (!text || String(text).trim() === '') return { status: 'success', translatedText: '' };
    return { status: 'success', originalText: text, translatedText: LanguageApp.translate(text, 'zh-TW', 'en') };
  } catch (err) {
    try {
      return { status: 'success', originalText: text, translatedText: LanguageApp.translate(text, '', 'en') };
    } catch (e2) {
      return { status: 'error', message: '翻譯失敗：' + err.toString() };
    }
  }
}

/* ==========================================================================
 * ADMISSION NOTES
 * ========================================================================== */

/**
 * Save an admission note: Sheets log + Google Doc + PDF/Word links.
 * @param {string} token
 * @param {Object} record
 */
function saveAdmissionNoteRecord(token, record) {
  var gate = authFail_(token);
  if (gate) return gate;

  try {
    var ss = getSpreadsheet();
    var timestamp = new Date();
    var noteId = 'ADM-' + Utilities.formatDate(timestamp, TZ, 'yyyyMMdd-HHmmss');

    record = record || {};
    var doctorName = record.doctorName || '朱國大醫師 (Dr. Kwo-Ta Chu)';
    var examDate = record.examDate || Utilities.formatDate(timestamp, TZ, 'yyyy-MM-dd');
    var patientId = record.patientId || 'ANON-' + Math.floor(1000 + Math.random() * 9000);
    var patientName = record.patientName || 'Anonymous Patient';
    var ageGender = record.ageGender || 'Unspecified';
    var wardBed = record.wardBed || 'Outpatient/ER';
    var department = record.department || 'Nephrology / Internal Medicine';

    var docResult = createAdmissionNoteDocReport(record, noteId, timestamp);

    // Columns 1-18 are the v5.0 layout and MUST stay in place; 19-26 are v6.0 additions.
    var headers = [
      '病歷編號 (Note ID)', '登錄時間 (Timestamp)', '入院日期 (Admission Date)', '病歷號 (MRN)',
      '病患姓名 (Patient Name)', '年齡/性別 (Age/Gender)', '病房/床號 (Ward/Bed)',
      '主治醫師 (Attending Doctor)', '診斷科別 (Department)', '主訴 (Chief Complaint)',
      '現在病史 (Present Illness)', '過去病史與過敏 (PMH & Allergies)', '理學檢查 (Physical Exam)',
      '初步診斷 (Impression)', '治療計畫 (Plan)', 'Google Doc 網址', 'PDF 下載網址', 'Word 下載網址',
      '手術史 (Past Surgical History)', '目前用藥 (Current Medications)', '家族史 (Family History)',
      '個人社會史 (Social History)', '系統回顧 (Review of Systems)', '生命徵象 (Vital Signs)',
      '入院檢驗與影像 (Labs & Imaging)', '問題清單 JSON (Problem List)',
      '身分證號碼 (National ID)', '出生日期 (Birth Date)', '住院史 (Hospitalization History)'
    ];

    var sheet = getOrCreateSheet(ss, 'Master_AdmissionNotes', headers);
    sheet.appendRow([
      noteId, timestamp, examDate, patientId, patientName, ageGender, wardBed,
      doctorName, department,
      record.chiefComplaint || '',
      record.presentIllness || '',
      'PMH: ' + (record.pastHistory || '') + ' | Allergy: ' + (record.allergies || 'NKDA'),
      record.physicalExam || '',
      record.impression || '',
      record.plan || '',
      docResult.docUrl, docResult.pdfUrl, docResult.docxUrl,
      record.surgicalHistory || '',
      record.medications || '',
      record.familyHistory || '',
      record.socialHistory || '',
      record.reviewOfSystems || '',
      record.vitalSigns || '',
      record.labsImaging || '',
      JSON.stringify(record.problemList || []),
      record.nationalId || '',
      record.birthDate || '',
      record.hospitalizationHistory || ''
    ]);

    return {
      status: 'success',
      noteId: noteId,
      docUrl: docResult.docUrl,
      pdfUrl: docResult.pdfUrl,
      docxUrl: docResult.docxUrl,
      message: '住院病歷紀錄已登錄至試算表，並已生成正式 Google Doc / PDF / Word 報告！'
    };
  } catch (err) {
    logDiagnostic_('saveAdmissionNoteRecord', err);
    return { status: 'error', message: '住院病歷儲存失敗：' + err.toString() };
  }
}

/**
 * Generate the formal Google Doc admission note.
 *
 * Layout mirrors the hospital's paper ADMISSION NOTE form (see
 * 02_參考資料/Admission Note_format): a bordered three-column letterhead in the
 * repeating page header, then 中文(English)： section headings in the order
 * 主訴 → 現在病歷 → 過去病史 → 藥物過敏 → 家族史 → 系統回顧 → 理學檢查 →
 * 檢驗報告 → 檢查報告 → 初步診斷 → 治療及計劃 → 主治醫師.
 */
function createAdmissionNoteDocReport(record, noteId, timestamp) {
  var reportsFolder = getReportsFolder_('住院病歷報告_GoogleDocs');

  var docTitle = 'AdmissionNote_' + (record.patientId || 'ANON') + '_' +
    Utilities.formatDate(timestamp, TZ, 'yyyyMMdd_HHmm');
  var doc = DocumentApp.create(docTitle);
  var body = doc.getBody();

  body.setMarginTop(40).setMarginBottom(40).setMarginLeft(48).setMarginRight(48);

  // Full letterhead at the top of the body (renders in Doc, PDF *and* Word), plus a
  // slim text-only page header so continuation pages stay identifiable. See
  // buildAdmissionLetterhead_ for why this is not in the page header.
  buildAdmissionLetterhead_(body, record);
  buildAdmissionPageHeader_(doc, record);

  // 主訴 / 現在病歷
  appendHospitalSection_(body, '主訴', 'Chief Complaints');
  appendHospitalLine_(body, record.chiefComplaint || '—');

  // Present Illness is a narrative paragraph, not a list of labelled fragments.
  appendHospitalSection_(body, '現在病歷', 'Present Illness');
  toNarrativeParagraphs_(record.presentIllness).forEach(function (para) {
    appendHospitalLine_(body, para);
  });

  // 過去病史 — the form's four fixed subheadings
  appendHospitalSection_(body, '過去病史', 'Past History');
  appendHospitalLine_(body, 'Past history :');
  appendHospitalLine_(body, '1. Disease : ' + (record.pastHistory || 'Non-contributory.'), 36);
  appendHospitalLine_(body, '2. History of trauma or surgery : ' + (record.surgicalHistory || 'Denied.'), 36);
  appendHospitalLine_(body, '3. History of hospitalization : ' + (record.hospitalizationHistory || 'Denied.'), 36);
  appendHospitalLine_(body, '4. Home medication reviews : ' + (record.medications || 'None.'), 36);

  // Personal History belongs here on 陽明醫院's form — under 過去病史, not 家族史.
  // The frontend composes the numbered block; fall back to socialHistory for
  // records saved before the field existed.
  if (record.personalHistory) {
    appendHospitalLine_(body, 'Personal History :');
    String(record.personalHistory).split('\n').forEach(function (line) {
      if (line) appendHospitalLine_(body, line, 36);
    });
  } else if (record.socialHistory) {
    appendHospitalLine_(body, 'Personal History :');
    appendHospitalLine_(body, record.socialHistory, 36);
  }

  appendHospitalSection_(body, '藥物過敏', 'Drug Allergy');
  appendHospitalLine_(body, record.allergies || 'The patient is not allergic to any type of food or medicine.');

  appendHospitalSection_(body, '家族史', 'Family History');
  appendHospitalLine_(body, record.familyHistory || 'There was no family history of hereditary or oncologic disease.');

  appendHospitalSection_(body, '系統回顧', 'Review of Systems');
  appendHospitalLine_(body, 'Review of systems');
  appendHospitalLine_(body, record.reviewOfSystems || '—', 36);

  appendHospitalSection_(body, '理學檢查', 'Physical Examination');
  appendHospitalLine_(body, 'Vital sign: ' + (record.vitalSigns || '—'));
  appendHospitalLine_(body, record.physicalExam || '—');

  // 檢驗報告 / 檢查報告 — English headings, same as every other section
  appendHospitalSection_(body, '檢驗報告', 'Laboratory Data');
  appendHospitalLine_(body, record.labsReport || record.labsImaging || 'Pending.');

  appendHospitalSection_(body, '檢查報告', 'Imaging and Other Studies');
  appendHospitalLine_(body, record.studiesReport || 'Pending.');

  // 初步診斷 / 治療及計劃 — numbered, from the problem list
  var problems = record.problemList || [];

  appendHospitalSection_(body, '初步診斷', 'Impression');
  if (problems.length) {
    for (var i = 0; i < problems.length; i++) {
      appendHospitalLine_(body, (i + 1) + '.' + ((problems[i] || {}).problem || 'Unnamed problem'), 36);
    }
  } else {
    appendHospitalLine_(body, record.impression || 'Pending initial diagnostic evaluations.', 36);
  }

  appendHospitalSection_(body, '治療及計劃', 'Management and Plan');
  if (problems.length) {
    var planNo = 0;
    for (var j = 0; j < problems.length; j++) {
      var pl = String((problems[j] || {}).plan || '').split('\n');
      for (var k = 0; k < pl.length; k++) {
        var line = pl[k].replace(/^\s*\d+[.)]\s*/, '').trim();
        if (line) appendHospitalLine_(body, (++planNo) + '.' + line, 36);
      }
    }
    if (!planNo) appendHospitalLine_(body, '1.Routine admission care.', 36);
  } else {
    appendHospitalLine_(body, record.plan || 'Routine admission care.', 36);
  }

  // 主治醫師 signature block, right-aligned as on the form
  styleP_(body.appendParagraph(''), { size: 10, before: 24 });
  styleP_(body.appendParagraph('主治醫師：' + (record.doctorName || '')),
    { size: 10.5, align: DocumentApp.HorizontalAlignment.RIGHT, before: 18 });
  styleP_(body.appendParagraph('Note ID: ' + noteId + '　|　' +
    Utilities.formatDate(timestamp, TZ, 'yyyy-MM-dd HH:mm')),
    { size: 8, align: DocumentApp.HorizontalAlignment.RIGHT, before: 6 })
    .setForegroundColor('#808080');

  // DocumentApp.create() seeds the body with one empty paragraph that would push the
  // letterhead down a line. Removed last, once there is other content, so the body is
  // never left as a bare table. Cosmetic — never let it fail the whole document.
  try {
    var seed = body.getChild(0);
    if (body.getNumChildren() > 1 &&
        seed.getType() === DocumentApp.ElementType.PARAGRAPH &&
        seed.asParagraph().getText() === '') {
      seed.removeFromParent();
    }
  } catch (e) {
    logDiagnostic_('removeSeedParagraph', e);
  }

  doc.saveAndClose();
  DriveApp.getFileById(doc.getId()).moveTo(reportsFolder);
  return docLinks_(doc.getId());
}

/**
 * Append a failure to a `_Diagnostics` tab so problems that only appear inside a
 * generated document can be inspected afterwards, instead of surfacing as a toast
 * the user has to relay by hand. Never throws — diagnostics must not break callers.
 */
/** True when the string contains CJK characters. Mirrors hasCJK() in index.html. */
function hasCJK_(s) {
  return /[㐀-鿿豈-﫿぀-ヿ]/.test(String(s || ''));
}

function logDiagnostic_(context, err) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName('_Diagnostics');
    if (!sheet) {
      sheet = ss.insertSheet('_Diagnostics');
      sheet.appendRow(['時間 (Timestamp)', '位置 (Context)', '錯誤 (Error)', '堆疊 (Stack)']);
      sheet.setFrozenRows(1);
    }
    sheet.appendRow([
      Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss'),
      String(context),
      err && err.message ? err.message : String(err),
      err && err.stack ? String(err.stack).slice(0, 900) : ''
    ]);
  } catch (ignored) {}
}

function appendDocSection_(body, heading, text) {
  body.appendParagraph('\n' + heading).setFontSize(12).setBold(true).setForegroundColor('#1e293b');
  body.appendParagraph(text).setFontSize(10.5).setBold(false);
}

/* --------------------------------------------------------------------------
 * Hospital admission-note formatting helpers
 * -------------------------------------------------------------------------- */

/** Convert an ISO date (yyyy-MM-dd) to the ROC calendar form used on the form. */
function toRocDate_(iso) {
  if (!iso) return '';
  var d = new Date(String(iso) + 'T00:00:00');
  if (isNaN(d.getTime())) return String(iso);
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  return (d.getFullYear() - 1911) + ' 年 ' + pad(d.getMonth() + 1) + ' 月 ' + pad(d.getDate()) + ' 日';
}

/** Apply a compact paragraph style; returns the paragraph for chaining. */
function styleP_(p, opts) {
  opts = opts || {};
  p.setFontSize(opts.size || 9).setBold(!!opts.bold);
  if (opts.align) p.setAlignment(opts.align);
  p.setSpacingBefore(opts.before || 0).setSpacingAfter(opts.after || 0);
  return p;
}

/**
 * Fill a table cell with several styled lines.
 * A cell always contains one empty paragraph, so the first line reuses it
 * rather than appending — otherwise every cell starts with a blank row.
 */
function setCellLines_(cell, lines) {
  var first = cell.getChild(0).asParagraph();
  first.setText(lines[0].text);
  styleP_(first, lines[0]);
  for (var i = 1; i < lines.length; i++) {
    styleP_(cell.appendParagraph(lines[i].text), lines[i]);
  }
  cell.setPaddingTop(2).setPaddingBottom(2).setPaddingLeft(5).setPaddingRight(5);
}

/**
 * Build the bordered letterhead block that repeats on every printed page,
 * matching the hospital's paper ADMISSION NOTE form:
 *
 *   +---------------------+------------------------+--------------+
 *   |      <醫院名稱>      | 病歷號 / 姓名 /         | 床號 / 生日 / |
 *   |   ADMISSION  NOTE   | 身分證號碼 / 住院日期    | 性別          |
 *   +---------------------+------------------------+--------------+
 *
 * Uses a real Google Docs header section so it repeats across pages.
 */
/**
 * The full three-column letterhead, appended to the TOP OF THE BODY.
 *
 * ⚠️ It used to live in the page header. Do not move it back. Google Docs drops a
 * TABLE inside a header when exporting to .docx, so the Word file came out with no
 * letterhead at all while the Doc and PDF looked correct — reported by Dr Chu
 * 2026-08-12 from a real note. In the body it renders identically in all three.
 * `buildAdmissionPageHeader_` still supplies a slim text-only continuation line,
 * which does survive the .docx export because it contains no table.
 */
function buildAdmissionLetterhead_(body, record) {
  var CENTER = DocumentApp.HorizontalAlignment.CENTER;
  var table = body.appendTable([['', '', '']]);
  table.setBorderColor('#000000').setBorderWidth(1);

  setCellLines_(table.getCell(0, 0), [
    { text: HOSPITAL_NAME, size: 16, bold: true, align: CENTER, before: 2 },
    { text: 'ADMISSION  NOTE', size: 12, bold: true, align: CENTER, after: 2 }
  ]);

  setCellLines_(table.getCell(0, 1), [
    { text: '病歷號：' + (record.patientId || '') },
    { text: '姓　　名：' + (record.patientName || '') },
    { text: '身分證號碼：' + (record.nationalId || '') },
    { text: '住院日期：' + toRocDate_(record.examDate) }
  ]);

  setCellLines_(table.getCell(0, 2), [
    { text: '床號：' + (record.wardBed || '') },
    { text: '生日：' + (record.birthDate || '') },
    // No ageGender fallback: it put the patient's age in the 性別 box.
    { text: '性別：' + (record.gender || '') }
  ]);

  table.setColumnWidth(0, 215).setColumnWidth(1, 190).setColumnWidth(2, 105);
  return table;
}

/**
 * Slim continuation header — one line, NO table, so it survives .docx export.
 * Keeps every printed page identifiable if the note runs past page 1.
 */
function buildAdmissionPageHeader_(doc, record) {
  // Cosmetic only — the letterhead that matters is in the body. A failure here must
  // never stop the note from being generated, which is exactly what happened when
  // this called getChild(0) on a freshly added header that has no children yet.
  try {
    var header = doc.getHeader() || doc.addHeader();
    header.clear();

    var bits = [HOSPITAL_NAME + ' ADMISSION NOTE'];
    if (record.patientId) bits.push('病歷號：' + record.patientId);
    if (record.patientName) bits.push('姓名：' + record.patientName);
    if (record.wardBed) bits.push('床號：' + record.wardBed);

    // appendParagraph always works; getChild(0) does not.
    styleP_(header.appendParagraph(bits.join('　|　')), { size: 8 })
      .setForegroundColor('#666666');

    // clear() may leave an empty paragraph behind it; drop any leading blanks.
    while (header.getNumChildren() > 1) {
      var first = header.getChild(0);
      if (first.getType() === DocumentApp.ElementType.PARAGRAPH &&
          first.asParagraph().getText() === '') {
        first.removeFromParent();
      } else break;
    }
    return header;
  } catch (e) {
    logDiagnostic_('buildAdmissionPageHeader_', e);
    return null;
  }
}

/** Section heading in the hospital's 中文(English)： style. */
/**
 * Section heading. English only — by Dr Chu's instruction the note body carries no
 * Chinese; only the letterhead and the attending signature stay in Chinese.
 * The `zh` argument is kept so call sites still document which form section this is.
 */
function appendHospitalSection_(body, zh, en) {
  return styleP_(body.appendParagraph(en + ' :'),
    { size: 11, bold: true, before: 10, after: 2 });
}

/** Plain body line, indented like the handwritten form. */
/**
 * Turn a Present Illness written as stacked fragments into flowing narrative.
 *
 * The LQQOPERA quick-fill chips used to insert one labelled sentence per line
 * ("Onset: ...", "Associated symptoms: ..."), which printed as a pseudo-bulleted
 * list and repeated the same label three times in a row. A blank line still starts
 * a new paragraph; single line breaks are joined into prose, and any leading
 * "Label:" is stripped.
 *
 * @return {string[]} one string per paragraph; [] becomes ['—'].
 */
function toNarrativeParagraphs_(text) {
  var LABEL = /^\s*(Onset|Location and quality|Location|Quality|Severity|Associated symptoms|Associated|Aggravating factors|Relieving factors|Emergency department course|Timing|Radiation)\s*:\s*/i;
  var paras = String(text == null ? '' : text).split(/\n\s*\n+/);
  var out = [];
  for (var i = 0; i < paras.length; i++) {
    var lines = paras[i].split('\n');
    var parts = [];
    for (var j = 0; j < lines.length; j++) {
      var s = lines[j].replace(LABEL, '').replace(/^\s*[-•*]\s*/, '').trim();
      if (!s) continue;
      if (!/[.?!:;,]$/.test(s)) s += '.';
      parts.push(s);
    }
    if (parts.length) out.push(parts.join(' '));
  }
  return out.length ? out : ['—'];
}

function appendHospitalLine_(body, text, indent) {
  var p = styleP_(body.appendParagraph(text), { size: 10 });
  p.setIndentStart(indent || 18);
  return p;
}

/**
 * Recent admission notes for the dashboard.
 * @param {string} token
 * @param {number} limit
 */
function getRecentAdmissionNotes(token, limit) {
  var gate = authFail_(token);
  if (gate) return gate;

  try {
    limit = limit || 20;
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName('Master_AdmissionNotes');
    if (!sheet) return { status: 'success', records: [] };

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: 'success', records: [] };

    var records = [];
    for (var i = data.length - 1; i >= 1 && records.length < limit; i--) {
      records.push(mapAdmissionRow_(data[i]));
    }
    return { status: 'success', records: records };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}

/**
 * Rebuild an existing EXAM report's Doc / PDF / Word using the CURRENT
 * formatting code, then point the log row at the new files.
 *
 * Same reason as regenerateAdmissionNoteDoc below: the stored links are files
 * rendered at save time, so a later layout change never reaches them. Without
 * this, seeing an old exam in the new hospital-form layout means retyping it.
 *
 * ⚠️ Regeneration is LOSSY for rows saved before the hospital-form layout
 * added columns 20-28. Those rows have no birth date, age, sex, payer status,
 * department, exam time, patient source, requesting unit or licence number, so
 * the report prints those header slots blank — exactly as the paper form is
 * left blank — rather than inventing values. Everything from columns 1-19
 * carries over intact. The original files are NOT deleted; the row is
 * repointed at the new ones.
 *
 * No translate option, unlike the admission note: exam findings are composed in
 * English by the templates, so there is no bilingual record to clean up.
 *
 * @param {string} token session token
 * @param {string} examId the 檢查編號 in column 1
 */
function regenerateExamDoc(token, examId) {
  var gate = authFail_(token);
  if (gate) return gate;

  try {
    if (!examId) return { status: 'error', message: '缺少檢查編號。' };
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName('Master_Exams');
    if (!sheet) return { status: 'error', message: '找不到 Master_Exams 工作表。' };

    var data = sheet.getDataRange().getValues();
    var rowIndex = -1;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(examId)) { rowIndex = i; break; }
    }
    if (rowIndex < 0) return { status: 'error', message: '找不到檢查編號 ' + examId + '。' };

    // mapExamRow_ already reads every column this needs — including examDate and
    // the header columns that are absent on pre-layout-change rows, which come
    // back as ''.
    var row = data[rowIndex];
    var links = createGoogleDocReport(mapExamRow_(row), examId, new Date());

    // Columns 12-14 (1-based) are docUrl / pdfUrl / docxUrl.
    sheet.getRange(rowIndex + 1, 12, 1, 3)
      .setValues([[links.docUrl, links.pdfUrl, links.docxUrl]]);

    var missingHeader = !row[19] && !row[21] && !row[23];
    return {
      status: 'success',
      examId: examId,
      docUrl: links.docUrl,
      pdfUrl: links.pdfUrl,
      docxUrl: links.docxUrl,
      message: '已用目前版本重新產生 ' + examId + ' 的文件。' +
        (missingHeader ? '（這筆是舊格式紀錄，表頭的生日／性別／科別等欄位當初沒有存，會留空）' : '')
    };
  } catch (err) {
    logDiagnostic_('regenerateExamDoc', err);
    return { status: 'error', message: '重新產生失敗：' + err.toString() };
  }
}

/**
 * Rebuild an existing note's Doc / PDF / Word using the CURRENT formatting code,
 * then point the log row at the new files.
 *
 * Why this exists: the download links stored on a row are files that were rendered
 * at save time, so they never pick up later formatting fixes. Without this, checking
 * a format change means retyping a whole note — the draft is deliberately cleared on
 * a successful save so the next patient's form starts empty.
 *
 * ⚠️ Regeneration is LOSSY for fields the log does not store separately:
 *   - personalHistory  → falls back to the logged socialHistory
 *   - labsReport / studiesReport → only the combined labsImaging column exists,
 *     so everything lands under Laboratory Data
 *   - gender → NOT recoverable. Left blank rather than guessed. It used to be taken
 *     from ageGender, which printed the patient's age in the 性別 box — a wrong
 *     identifier on a clinical document is worse than an empty one.
 * The original files are NOT deleted; the row is repointed at the new ones.
 *
 * @param {boolean} translateToEnglish when true, any clinical field still containing
 *   Chinese is machine-translated and WRITTEN BACK to the log before rendering.
 *   Caller-driven and explicit — never done silently. Output needs human review.
 */
function regenerateAdmissionNoteDoc(token, noteId, translateToEnglish) {
  var gate = authFail_(token);
  if (gate) return gate;

  try {
    if (!noteId) return { status: 'error', message: '缺少病歷編號。' };
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName('Master_AdmissionNotes');
    if (!sheet) return { status: 'error', message: '找不到 Master_AdmissionNotes 工作表。' };

    var data = sheet.getDataRange().getValues();
    var rowIndex = -1;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(noteId)) { rowIndex = i; break; }
    }
    if (rowIndex < 0) return { status: 'error', message: '找不到病歷編號 ' + noteId + '。' };

    var row = data[rowIndex];

    // Optional, explicit, caller-driven translation of any field still in Chinese.
    // Written back to the log so the record itself stops being bilingual, not just
    // this rendering of it.
    var translatedFields = [];
    if (translateToEnglish) {
      // 0-based row indices of free-text clinical fields. The PMH/Allergy composite
      // at index 11 is excluded: translating it would mangle its own labels.
      [9, 10, 13, 14, 18, 19, 20, 22].forEach(function (idx) {
        var val = String(row[idx] == null ? '' : row[idx]);
        if (!val.trim() || !hasCJK_(val)) return;
        try {
          var en = LanguageApp.translate(val, 'zh-TW', 'en');
          if (en && en.trim()) {
            row[idx] = en;
            sheet.getRange(rowIndex + 1, idx + 1).setValue(en);
            translatedFields.push(idx);
          }
        } catch (e) {
          logDiagnostic_('regenerate.translate.col' + (idx + 1), e);
        }
      });
    }

    // Column 12 stores "PMH: <pastHistory> | Allergy: <allergies>" — split it back.
    var pmhCell = String(row[11] || '');
    var pastHistory = pmhCell, allergies = '';
    var sepAt = pmhCell.indexOf(' | Allergy: ');
    if (sepAt >= 0) {
      pastHistory = pmhCell.slice(0, sepAt);
      allergies = pmhCell.slice(sepAt + ' | Allergy: '.length);
    }
    pastHistory = pastHistory.replace(/^PMH:\s*/, '');

    var problemList = [];
    try { problemList = JSON.parse(row[25] || '[]') || []; } catch (e) { problemList = []; }

    var record = {
      // gender is deliberately absent — see the LOSSY note above. The letterhead
      // prints an empty 性別 box rather than the age.
      patientId: row[3], patientName: row[4], ageGender: row[5], gender: '',
      wardBed: row[6], doctorName: row[7], department: row[8],
      examDate: row[2] ? Utilities.formatDate(new Date(row[2]), TZ, 'yyyy-MM-dd') : '',
      chiefComplaint: row[9],
      presentIllness: row[10],
      pastHistory: pastHistory,
      allergies: allergies,
      physicalExam: row[12],
      impression: row[13],
      plan: row[14],
      surgicalHistory: row[18],
      medications: row[19],
      familyHistory: row[20],
      socialHistory: row[21],
      reviewOfSystems: row[22],
      vitalSigns: row[23],
      labsReport: row[24],
      studiesReport: '',
      problemList: problemList,
      nationalId: row[26],
      birthDate: row[27],
      hospitalizationHistory: row[28]
    };

    var links = createAdmissionNoteDocReport(record, noteId, new Date());

    // Columns 16-18 (1-based) are docUrl / pdfUrl / docxUrl.
    sheet.getRange(rowIndex + 1, 16, 1, 3)
      .setValues([[links.docUrl, links.pdfUrl, links.docxUrl]]);

    return {
      status: 'success',
      noteId: noteId,
      docUrl: links.docUrl,
      pdfUrl: links.pdfUrl,
      docxUrl: links.docxUrl,
      translatedCount: translatedFields.length,
      message: '已用目前版本重新產生 ' + noteId + ' 的文件。' +
        (translatedFields.length
          ? '（已翻譯 ' + translatedFields.length + ' 個欄位並更新紀錄，請校閱）'
          : '')
    };
  } catch (err) {
    logDiagnostic_('regenerateAdmissionNoteDoc', err);
    return { status: 'error', message: '重新產生失敗：' + err.toString() };
  }
}

function mapAdmissionRow_(row) {
  return {
    noteId: row[0],
    timestamp: formatRecordDate_(row[1], 'yyyy-MM-dd HH:mm'),
    examDate: formatRecordDate_(row[2], 'yyyy-MM-dd'),
    patientId: row[3],
    patientName: row[4],
    ageGender: row[5],
    wardBed: row[6],
    doctorName: row[7],
    department: row[8],
    chiefComplaint: row[9],
    presentIllness: row[10],
    impression: row[13],
    plan: row[14],
    docUrl: row[15],
    pdfUrl: row[16],
    docxUrl: row[17]
  };
}

/**
 * Keyword search across admission notes.
 * Searches note ID, admission date, MRN, patient name, age/gender, ward/bed,
 * attending, department, chief complaint, present illness and impression.
 * @param {string} token
 * @param {string} query
 */
function searchAdmissionNotes(token, query) {
  var gate = authFail_(token);
  if (gate) return gate;

  try {
    query = (query || '').toLowerCase().trim();
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName('Master_AdmissionNotes');
    if (!sheet) return { status: 'success', records: [] };

    var data = sheet.getDataRange().getValues();
    var results = [];

    for (var i = data.length - 1; i >= 1; i--) {
      var row = data[i];
      var haystack = [
        row[0], row[2], row[3], row[4], row[5], row[6],
        row[7], row[8], row[9], row[10], row[13]
      ].join(' ').toLowerCase();
      if (!query || haystack.indexOf(query) !== -1) results.push(mapAdmissionRow_(row));
      if (results.length >= 50) break;
    }
    return { status: 'success', records: results };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}

/* ==========================================================================
 * SELF TEST
 *
 * The web app cannot be exercised from the command line, so DocumentApp method
 * errors (e.g. `setFontColor` does not exist on a Paragraph — it is
 * `setForegroundColor`) only surface when a physician presses Save.
 *
 * Run `runSelfTest` from the Apps Script editor after any change to the report
 * generators. It drives the real production code paths with dummy data, then
 * trashes whatever it created. Read the result in the execution log.
 * ========================================================================== */

function runSelfTest() {
  var log = [];
  var created = [];

  function step(name, fn) {
    try {
      var r = fn();
      log.push('PASS  ' + name);
      return r;
    } catch (e) {
      log.push('FAIL  ' + name + '  ->  ' + (e && e.message ? e.message : e));
      return null;
    }
  }

  var now = new Date();

  step('getSpreadsheet()', function () { return getSpreadsheet().getName(); });

  step('token sign/verify round-trip', function () {
    var t = issueToken_();
    if (!isValidToken_(t)) throw new Error('freshly issued token failed validation');
    if (isValidToken_('0.deadbeef')) throw new Error('expired/forged token was accepted');
    return 'ok';
  });

  step('exam header date/width helpers', function () {
    var cases = [
      [toRocSlash_('2026-08-13'), '115/08/13'],
      [toRocSlash_('115/03/04'), '115/03/04'],
      [toRocBirth_('0400101'), '民國040/01/01'],
      [toRocBirth_('1951-01-01'), '民國040/01/01'],
      [toRocBirth_('unparseable'), 'unparseable'],
      [String(dispWidth_('王小明')), '6'],
      [padTo_('ab', 5) + '|', 'ab   |']
    ];
    for (var i = 0; i < cases.length; i++) {
      if (cases[i][0] !== cases[i][1]) {
        throw new Error('case ' + i + ': got "' + cases[i][0] + '", want "' + cases[i][1] + '"');
      }
    }
    return 'ok';
  });

  step('every exam type has its own << TITLE >>', function () {
    var types = ['Echocardiogram', 'Abdominal Sonography', 'UGI Endoscopy', 'LGI Endoscopy'];
    var seen = {};
    for (var i = 0; i < types.length; i++) {
      var t = examReportTitle_(types[i]);
      if (!t || t === 'EXAMINATION REPORT') throw new Error('no title for ' + types[i]);
      if (seen[t]) throw new Error('duplicate title: ' + t);
      seen[t] = true;
      if (!examItemLabel_(types[i])) throw new Error('no exam item label for ' + types[i]);
    }
    return 'ok';
  });

  var examDoc = step('createGoogleDocReport() — every paragraph/table style call', function () {
    return createGoogleDocReport({
      examType: 'Echocardiogram', doctorName: 'Self Test', examDate: '2026-01-01',
      patientId: 'SELFTEST', patientName: 'Self Test', indication: 'self test',
      technique: 'self test', comparison: 'none', symptoms: 'self test',
      diagnosis: 'self test', findings: 'line1\nline2', impression: 'self test',
      recommendation: 'self test',
      birthDate: '0400101', patientAge: '65', gender: 'Male',
      payerStatus: 'NHI (健保)', department: 'Cardiology (心臟內科)', examTime: '09:47',
      patientSource: 'Inpatient (住院)', requestingUnit: 'Internal Medicine',
      licenseNo: 'SELFTEST-000376'
    }, 'SELFTEST-EXAM', now);
  });
  if (examDoc && examDoc.docId) created.push(examDoc.docId);

  step('createGoogleDocReport() — empty optional-header branch', function () {
    var d = createGoogleDocReport({
      examType: 'LGI Endoscopy', patientId: 'SELFTEST', examDate: '2026-01-01'
    }, 'SELFTEST-EXAM2', now);
    if (d && d.docId) created.push(d.docId);
    return 'ok';
  });

  var admDoc = step('createAdmissionNoteDocReport() — incl. problem-list branch', function () {
    return createAdmissionNoteDocReport({
      patientId: 'SELFTEST', patientName: 'Self Test', ageGender: '60yo Male',
      gender: 'Male', nationalId: 'SELFTEST', birthDate: '0500101',
      examDate: '2026-01-01', wardBed: 'A-1', doctorName: 'Self Test',
      department: 'Nephrology', informant: 'Patient', reliability: 'Reliable',
      chiefComplaint: 'self test', presentIllness: 'self test', pastHistory: 'self test',
      surgicalHistory: 'self test', hospitalizationHistory: 'self test',
      medications: 'self test', allergies: 'NKDA',
      familyHistory: 'self test', socialHistory: 'self test', reviewOfSystems: 'self test',
      vitalSigns: 'self test', physicalExam: 'self test',
      labsReport: 'self test', studiesReport: 'self test', labsImaging: 'self test',
      problemList: [{ problem: 'Problem 1', plan: '1. step one\n2. step two' }]
    }, 'SELFTEST-ADM', now);
  });
  if (admDoc && admDoc.docId) created.push(admDoc.docId);

  step('createAdmissionNoteDocReport() — empty problem-list fallback branch', function () {
    var d = createAdmissionNoteDocReport({
      patientId: 'SELFTEST', patientName: 'Self Test', examDate: '2026-01-01',
      impression: 'self test', plan: 'self test', problemList: []
    }, 'SELFTEST-ADM2', now);
    if (d && d.docId) created.push(d.docId);
    return 'ok';
  });

  step('export URL shape', function () {
    if (!examDoc) throw new Error('skipped — exam doc was not created');
    ['docUrl', 'pdfUrl', 'docxUrl'].forEach(function (k) {
      if (!examDoc[k] || examDoc[k].indexOf('docs.google.com/document/d/') === -1) {
        throw new Error('bad ' + k + ': ' + examDoc[k]);
      }
    });
    return 'ok';
  });

  step('LanguageApp.translate()', function () {
    return LanguageApp.translate('發燒三天', 'zh-TW', 'en');
  });

  var trashed = 0;
  created.forEach(function (id) {
    try { DriveApp.getFileById(id).setTrashed(true); trashed++; } catch (e) {}
  });
  log.push('CLEAN ' + trashed + '/' + created.length + ' test document(s) moved to trash');

  var failures = log.filter(function (l) { return l.indexOf('FAIL') === 0; }).length;
  log.push('');
  log.push(failures ? ('RESULT: ' + failures + ' FAILURE(S)') : 'RESULT: ALL PASSED');

  var out = log.join('\n');
  Logger.log(out);
  return out;
}
